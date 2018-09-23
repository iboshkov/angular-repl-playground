import * as express from "express";
import { User, IUserModel, verifyPass } from "../models/user";
export const router = express.Router();
export const authRouter = express.Router();

async function populate(items: IUserModel | IUserModel[]) {
  await User.populate(items, {
    path: "children",
    populate: [
      {
        path: "grades",
        populate: [
          { path: "course" },
          { path: "teacher" },
        ]
      },
      {
        path: "absences",
        populate: [
          { path: "scheduleCheck" },
          {
            path: "scheduleEntry",
            populate: [
              {
                path: "course"
              },
              {
                path: "teacher"
              }
            ]
          }
        ]
      }
    ]
  });
}

router.get("/", async (req, res, next) => {
  const filter: any = {};

  if (req.query.teachers) {
    filter.isTeacher = true;
  }

  if (req.query.parents) {
    filter.isParent = true;
  }

  const users = await User.find(filter).select("-password");
  await populate(users);
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  await populate(user);
  res.json(user);
});


router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  res.sendStatus(200);
});

router.post('/', async (req, res, next) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    await populate(result);
    await res.json(result);
  } catch (err) {
    next(err)
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.set(req.body);
    const result = await user.save();
    await populate(result);
    await res.json(result);
  } catch (err) {
    next(err)
  }
});

authRouter.post("/login", async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.username.toLowerCase(),
  });
  await populate(user);

  let valid = false;

  if (user) {
    valid = await verifyPass(req.body.password, user.password);
  }

  if (!valid) {
    return res.json({ error: "Username or password don't match" });
  }

  user.password = undefined;
  req.session.user = user;
  res.json(req.session.user);
});

authRouter.get("/", async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(req.session.user);
});

authRouter.get("/logout", async (req, res, next) => {
  req.session.user = undefined;
  res.redirect("/ ");
});

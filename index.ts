import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import jwt, { Secret } from "jsonwebtoken"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT
const KEY = process.env.SECRET
const prisma = new PrismaClient()

function createJwt(username: string) {
  return jwt.sign({ username }, KEY as Secret, { expiresIn: "1hr" })
}

app.use(express.json())
app.use(cookieParser())
app.use(cors({ credentials: true, origin: "https://learnifyhoney.netlify.app" }))

app.post("/user/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body
  const user = await prisma.user.findFirst({ where: { username } })
  if (user) {
    res.status(400).send({ msg: "User already exists!" })
  } else {
    const newUser = await prisma.user.create({
      data: { username, password },
    })
    res.status(200).send({ msg: "New User Created" })
  }
})

app.post("/user/login", async (req: Request, res: Response) => {
  const { username, password } = req.body
  const user = await prisma.user.findFirst({
    where: { username, password },
  })
  if (!user) {
    res.status(400).send({ msg: "User does not exist" })
  } else if (user) {
    const token = createJwt(username)
    res.status(200).send({ msg: "User has logged in", username, token })
  } else {
    res.status(200).send({ msg: "User does not exist" })
  }
})

app.get("/allusers", async (req: Request, res: Response) => {
  const allusers = await prisma.user.findMany()
  res.status(200).send(allusers)
})

app.post("/createCourse", async (req: Request, res: Response) => {
  const { title, description, price, url } = req.body
  const alreadyCourse = await prisma.courses.findFirst({
    where: { title, description },
  })
  if (alreadyCourse) {
    res.status(400).send({ msg: "This course is already created" })
  } else {
    const newCourse = await prisma.courses.create({
      data: { title, description, price, url },
    })
    res.status(200).send({ msg: "Created new course", newCourse })
  }
})

app.get("/allcourses", async (req: Request, res: Response) => {
  const allCourses = await prisma.courses.findMany()
  res.send(allCourses)
})

app.post("/purCourse", async (req: Request, res: Response) => {
  const id = parseInt(req.body.id, 36)
  const username = req.body.user
  const user = await prisma.user.findFirst({ where: { username } })
  const course = await prisma.courses.findFirst({ where: { id } })

  console.log(user, course)
  if (!user) {
    res.status(400).send({ msg: "user not found" })
    return
  }
  if (!course) {
    res.status(400).send({ msg: "Course does not exist" })
    return
  }
  const alreadyCourse = await prisma.userCourse.findMany({
    where: { username, courseId: course.id },
  })
  if (alreadyCourse.length > 0) {
    res.status(400).send({ msg: "User has already purchased this course" })
    return
  }
  const purCourse = await prisma.userCourse.create({
    data: {
      userId: user.id,
      username: user.username,
      courseId: course.id,
      title: course.title,
      description: course.description,
      url: course.url,
    },
  })
  res.send({ msg: "Course Purchased", course })
})

app.get("/userCourses", async (req: Request, res: Response) => {
  const username = req.cookies.username
  const userCourses = await prisma.userCourse.findMany({
    where: { username },
  })
  res.status(200).send(userCourses)
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})

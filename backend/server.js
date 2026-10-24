const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://labsetu-taupe.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      const isVercelPreview =
        origin &&
        /^https:\/\/labsetu-[a-z0-9-]+-deepakit0783-3684\.vercel\.app$/.test(
          origin
        );

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isVercelPreview
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
  })
);

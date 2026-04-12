import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { globalLimiter } from "./middlewares/rate-limiters";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { apiRouter } from "./routes";

const swaggerPath = path.resolve(__dirname, "..", "docs", "openapi.yaml");
const swaggerDocument = YAML.load(swaggerPath);

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(globalLimiter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Error as MongooseError } from "mongoose";

import { APIResponse, IErrorCodeMessageMap } from "../types/api-response";
import CustomAPIError from "../errors/custom-api";

const errorHandler = (
  err: Error & CustomAPIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorCodeMessageMap: IErrorCodeMessageMap = {
    400: { code: "BAD_REQUEST", message: "Invalid input data" },
    404: {
      code: "RESOURCE_NOT_FOUND",
      message: "The requested resource was not found.",
    },
    500: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred on the server. Please try again later",
    },
  };

  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    details: err.message || "Something went wrong",
  };

  if (err instanceof MongooseError.ValidationError) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.details = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  if (err instanceof MongooseError.CastError) {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.details = `No resource found with id = ${err.value}`;
  }

  const mappedError = errorCodeMessageMap[customError.statusCode];
  const errorResponse: APIResponse = {
    status: "error",
    statusCode: customError.statusCode,
    error: {
      code: mappedError.code,
      message: mappedError.message,
      details: customError.details,
    },
  };

  res.status(customError.statusCode).send(errorResponse);
};

export default errorHandler;

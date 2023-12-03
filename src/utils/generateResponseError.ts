import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

export const generateResponseError = (errors: ValidationError[]) => {
  const errorsForResponse: {message: string, field: string}[] = []

  errors.forEach(err => {
    const constraintsKeys = Object.keys(err.constraints ?? {})

    constraintsKeys.forEach(constraintsKey => {
      errorsForResponse.push({
        message: err.constraints ? err.constraints[constraintsKey] : '',
        field: err.property,
      })
    })

  })

  throw new BadRequestException(errorsForResponse)
}

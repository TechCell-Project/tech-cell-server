import { i18nValidationMessage } from 'nestjs-i18n';
import {
    ValidationOptions,
    IsNumber,
    IsNumberOptions,
    IsString,
    IsInt,
    IsArray,
    IsDate,
    IsEnum,
    IsNotEmpty,
    Length,
    MinLength,
    MaxLength,
    IsPositive,
    IsNegative,
    MinDate,
    MaxDate,
    Min,
    Max,
    IsEmail,
    IsBoolean,
    IsMongoId,
    IsLowercase,
    IsUppercase,
    IsNotEmptyObject,
    ArrayMinSize,
    ArrayMaxSize,
} from 'class-validator';
import ValidatorJS from 'validator';

export const IsNumberI18n = (options?: IsNumberOptions, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsNumber(options, {
            message: i18nValidationMessage('validation.IS_NUMBER'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsStringI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsString({
            message: i18nValidationMessage('validation.IS_STRING'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsIntI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsInt({
            message: i18nValidationMessage('validation.IS_INT'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsArrayI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsArray({
            message: i18nValidationMessage('validation.IS_ARRAY'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsDateI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsDate({
            message: i18nValidationMessage('validation.IS_DATE'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsEnumI18n = (entity: object, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsEnum(entity, {
            message: i18nValidationMessage('validation.IS_ENUM'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsNotEmptyI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsNotEmpty({
            message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
            ...validationOptions,
        })(target, key);
    };
};

export const LengthI18n = (min: number, max?: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        Length(min, max, {
            message: i18nValidationMessage('validation.LENGTH'),
            ...validationOptions,
        })(target, key);
    };
};

export const MinLengthI18n = (min: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        MinLength(min, {
            message: i18nValidationMessage('validation.MIN_LENGTH'),
            ...validationOptions,
        })(target, key);
    };
};

export const MaxLengthI18n = (max: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        MaxLength(max, {
            message: i18nValidationMessage('validation.MAX_LENGTH'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsPositiveI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsPositive({
            message: i18nValidationMessage('validation.IS_POSITIVE'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsNegativeI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsNegative({
            message: i18nValidationMessage('validation.IS_NEGATIVE'),
            ...validationOptions,
        })(target, key);
    };
};

export const MinDateI18n = (date: Date, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        MinDate(date, {
            message: i18nValidationMessage('validation.MIN_DATE'),
            ...validationOptions,
        })(target, key);
    };
};

export const MaxDateI18n = (date: Date, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        MaxDate(date, {
            message: i18nValidationMessage('validation.MAX_DATE'),
            ...validationOptions,
        })(target, key);
    };
};

export const MinI18n = (min: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        Min(min, {
            message: i18nValidationMessage('validation.MIN'),
            ...validationOptions,
        })(target, key);
    };
};

export const MaxI18n = (max: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        Max(max, {
            message: i18nValidationMessage('validation.MAX'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsEmailI18n = (
    options?: ValidatorJS.IsEmailOptions,
    validationOptions?: ValidationOptions,
) => {
    return (target: object, key: string) => {
        IsEmail(options, {
            message: i18nValidationMessage('validation.IS_EMAIL'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsBooleanI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsBoolean({
            message: i18nValidationMessage('validation.IS_BOOLEAN'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsMongoIdI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsMongoId({
            message: i18nValidationMessage('validation.IS_MONGO_ID'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsLowercaseI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsLowercase({
            message: i18nValidationMessage('validation.IS_LOWERCASE'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsUppercaseI18n = (validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        IsUppercase({
            message: i18nValidationMessage('validation.IS_UPPERCASE'),
            ...validationOptions,
        })(target, key);
    };
};

export const IsNotEmptyObjectI18n = (
    options?: {
        nullable?: boolean;
    },
    validationOptions?: ValidationOptions,
) => {
    return (target: object, key: string) => {
        IsNotEmptyObject(options, {
            message: i18nValidationMessage('validation.IS_NOT_EMPTY_OBJECT'),
            ...validationOptions,
        })(target, key);
    };
};

export const ArrayMinSizeI18n = (min: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        ArrayMinSize(min, {
            message: i18nValidationMessage('validation.ARRAY_MIN_SIZE'),
            ...validationOptions,
        })(target, key);
    };
};

export const ArrayMaxSizeI18n = (max: number, validationOptions?: ValidationOptions) => {
    return (target: object, key: string) => {
        ArrayMaxSize(max, {
            message: i18nValidationMessage('validation.ARRAY_MAX_SIZE'),
            ...validationOptions,
        })(target, key);
    };
};

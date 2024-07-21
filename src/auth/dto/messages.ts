export const telephoneMustBeNumberStringError = "Телефон должен быть строкой только из цифр";
export const passwordStrengthError = "Пароль должен включать по крайней мере: 1 заглавную букву, 1 специальный символ и иметь минимум 8 символов";

export const userFirstAndLastNamesLength = [2, 16] as const;
export const userFirstnameFormatError = "Имя должно быть написано на одном языке";
export const userFirstnameLengthError = `Длина имени может быть от ${userFirstAndLastNamesLength[0]} до ${userFirstAndLastNamesLength[1]} символов.`;
export const userLastnameFormatError = "Фамилия должна быть написана на одном языке";
export const userLastnameLengthError = `Длина фамилия может быть от ${userFirstAndLastNamesLength[0]} до ${userFirstAndLastNamesLength[1]} символов.`;

export const usernameLength = [4, 16] as const;
export const usernameLengthError = `Длина ссылки-username должна быть от ${usernameLength[0]} до ${usernameLength[1]} букв`;
export const usernameFormatError = "Ссылка username должен состоять из латиницы, цифр, нижнего подчеркивания.";

export const userFirstAndLastNameRegexp = /^([а-яА-ЯёЁ]+|[a-zA-Z]+)$/;
export const usernameRegexp = /^([a-zA-Z0-9_]+)$/;

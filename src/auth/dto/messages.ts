export const telephoneMustBeNumberStringError = 'Телефон должен быть строкой только из цифр';
export const passwordStrengthError = 'Пароль должен включать по крайней мере: 1 заглавную букву, 1 специальный символ и иметь минимум 8 символов'

export const userFirstAndLastNamesLength = [2, 16] as const
export const userFirstAndLastNamesFormatError =  'Имя и фамилия может быть только на русском или только на английском'
export const userFirstAndLastNamesLengthError = `Длины имени и фамилии должны быть от ${userFirstAndLastNamesLength[0]} до ${userFirstAndLastNamesLength[1]} букв`

export const usernameLength = [4, 16] as const;
export const usernameLengthError = `Длина ссылки-username должна быть от ${usernameLength[0]} до ${usernameLength[1]} букв`
export const usernameFormatError = 'Ссылка-username может состоять из строчных латинских букв, цифр, и точки. При этом точка не может быть в начале или конце.'

export const userFirstAndLastNameRegexp = /^([а-яА-ЯёЁ]+|[a-zA-Z]+)$/
export const usernameRegexp = /^([a-z0-9]+)$/

export const requiredEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Falta la variable de entorno obligatoria: ${key}`);
	}
	return value;
};

export type LoginCredentials = {
	loginUrl: string;
	loginUsername: string;
	loginPassword: string;
};

export type TransferData = LoginCredentials & {
	monto: string;
	concepto: string;
	correo: string;
	cuentaGT: string;
	codeABA: string;
	codeSWIFT: string;
	cuentaABA: string;
	cuentaSWIFT: string;
};

export const getLoginCredentials = (): LoginCredentials => ({
	loginUrl: requiredEnv('LOGIN_URL'),
	loginUsername: requiredEnv('LOGIN_USERNAME'),
	loginPassword: requiredEnv('LOGIN_PASSWORD'),
});

export const getTransferData = (): TransferData => ({
	...getLoginCredentials(),
	monto: requiredEnv('TRANSFER_AMOUNT'),
	concepto: requiredEnv('TRANSFER_CONCEPT'),
	correo: requiredEnv('TRANSFER_EMAIL'),
	cuentaGT: requiredEnv('TRANSFER_ACCOUNT_GT'),
	codeABA: requiredEnv('TRANSFER_CODE_ABA'),
	codeSWIFT: requiredEnv('TRANSFER_CODE_SWIFT'),
	cuentaABA: requiredEnv('TRANSFER_ACCOUNT_ABA'),
	cuentaSWIFT: requiredEnv('TRANSFER_ACCOUNT_SWIFT'),
});
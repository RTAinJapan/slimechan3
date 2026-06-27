// NodeCG から得る「現在どのゲームか」のポインタ情報。
export type Pointer = {
	currentPk: number | null;
	nextPk: number | null;
	online: boolean;
	lastUpdate: number | null;
};

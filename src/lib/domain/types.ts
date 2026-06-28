// シートを横断した情報を pk（tracker run の主キー）で集約したドメインモデル。

export type Person = {
	name: string;
	discordId?: string;
};

export type Runner = Person;

export type Commentator = Person & {
	participationMethod?: string; // 参加方法（例: オフライン（会場での参加））
};

export type Voting = {
	rta?: string;
	trackerLink?: string;
	isPublic?: boolean; // 公開
	closed?: boolean; // 投票〆た
	description?: string; // 説明
	closeTiming?: string; // 〆タイミング
};

export type GameMemo = {
	owner?: string; // 担当
	content?: string; // 内容
};

export type TimerTiming = {
	start?: string; // タイマースタート
	stop?: string; // タイマーストップ
	referenceVideo?: string; // 参考動画
};

export type Game = {
	pk: number; // join キー（schedule.pkId）
	scheduleOrder: number; // ゲーム行の並び順（行番号ではない）
	date?: string; // 直近の日付区切り行（例: 2025/08/09）。時刻推定に使う
	time?: string;
	title: string;
	category?: string;
	platform?: string; // 機種
	participationForm?: string; // 参加形態
	est?: string;
	hasVoting?: boolean; // 投票有無
	layout?: string;
	runnerCount?: number;
	commentatorCount?: number;
	runners: Runner[];
	commentators: Commentator[];
	voting?: Voting;
	memo?: GameMemo;
	timerTiming?: TimerTiming;
	isBackup?: boolean;
};

export type VolunteerTable = {
	headers: string[];
	rows: string[][];
};

// /api/games のレスポンス形。
export type GamesData = {
	games: Game[]; // schedule 順
	backups: Game[];
	volunteer: VolunteerTable;
	fetchedAt: number;
	stale: boolean;
};

// シートを横断した情報を pk（tracker run の主キー）で集約したドメインモデル。

export type Person = {
	name: string;
	discordId?: string;
};

export type Runner = Person;

export type Commentator = Person & {
	participationMethod?: string; // 参加方法（例: オフライン（会場での参加））
};

// 1 ゲームに複数の投票項目（bid）がありうる。1 件 = 1 bid。
export type Voting = {
	key: string; // 投票〆トグルの永続キー（bid:{id} または run:{pk}:{idx}）
	bidId?: number; // Tracker の bid id（リンクから抽出）
	rta?: string;
	trackerLink?: string;
	isPublic?: boolean; // 公開
	closed?: boolean; // 投票〆た（シート上の初期値。アプリのトグルが優先）
	description?: string; // 説明
	closeTiming?: string; // 〆タイミング
};

// Tracker API (type=bid) から得る投票項目の進捗。
export type BidProgress = {
	bidId: number;
	name?: string;
	description?: string;
	goal?: number | null; // 目標金額（選択式投票では null）
	total?: number; // 現在の金額
	state?: string; // 受付状態（OPENED / CLOSED / HIDDEN など）
	count?: number; // 投票/寄付件数
	isChoice?: boolean; // 選択式投票（bidwar）か
	// 選択式投票の各選択肢（金額の降順）。
	options?: {name: string; total: number}[];
	fetchedAt?: number; // Tracker から実際に取得した時刻（キャッシュ返却時は取得元の時刻）
};

// 投票〆トグルのアプリ側オーバーライド（key -> closed）。
export type VoteOverrides = Record<string, boolean>;

export type GameMemo = {
	owner?: string; // 担当
	content?: string; // 内容
};

export type TimerTiming = {
	start?: string; // タイマースタート
	stop?: string; // タイマーストップ
	referenceVideo?: string; // 参考動画
};

// schedule のゲーム以外の進行行（CM動画再生・配信枠の立て直し・配信開始・OP など）。
// 日付だけの区切り行は含まない。
export type ScheduleEvent = {
	date?: string;
	time?: string;
	title: string;
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
	votings: Voting[];
	memo?: GameMemo;
	timerTiming?: TimerTiming;
	// 前のゲーム（または当日開始）からこのゲームまでの間の進行イベント。
	precedingEvents: ScheduleEvent[];
	isBackup?: boolean;
};

export type VolunteerTable = {
	headers: string[];
	rows: string[][];
};

// schedule の並び順を、ゲームと「連続する進行イベント群」で表したタイムライン。
export type TimelineEntry =
	{kind: "game"; game: Game} | {kind: "events"; events: ScheduleEvent[]};

// /api/games のレスポンス形。
export type GamesData = {
	games: Game[]; // schedule 順
	backups: Game[];
	timeline: TimelineEntry[]; // schedule シート全体（ゲーム＋進行イベント群）
	trailingEvents: ScheduleEvent[]; // 最終ゲーム以降の進行（全ゲーム終了・ED 等）
	volunteer: VolunteerTable;
	fetchedAt: number;
	stale: boolean;
};

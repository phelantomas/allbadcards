import {ErrorDataStore} from "../DataStore/ErrorDataStore";
import ReactGA from "react-ga";

type PlayerMap = { [key: string]: GamePlayer };

export interface IPackDef
{
	packId: string;
	packName: string;
	blackCount: number;
	whiteCount: number;
}

export interface GamePlayer
{
	guid: string;
	nickname: string;
	wins: number;
	whiteCards: number[];
	isSpectating: boolean;
}

export interface GameItem
{
	id: string;
	roundIndex: number;
	roundStarted: boolean;
	ownerGuid: string;
	chooserGuid: string | null;
	started: boolean;
	dateCreated: Date;
	public: boolean;
	players: PlayerMap;
	spectators: PlayerMap;
	blackCard: number;
	// key = player guid, value = white card ID
	roundCards: { [key: string]: number[] };
	usedBlackCards: number[];
	usedWhiteCards: number[];
	revealIndex: number;
	lastWinner: {
		playerGuid: string;
		whiteCardIds: number[];
	} | undefined;
	randomOffset: number;
	settings: {
		password: string | null;
		roundsToWin: number;
		includedPacks: string[];
		includedCardcastPacks: string[];
	}
}

export interface IBlackCard
{
	text: string;
	pick: number;
}

export type IWhiteCard = string;

class _Platform
{
	public static Instance = new _Platform();

	private loadedWhiteCards: { [cardId: string]: IWhiteCard } = {};

	private static trackEvent(action: string, label?: string, value?: number)
	{
		ReactGA.event({
			action,
			category: "Game",
			label,
			value
		});
	}

	private static async doGet<TData>(url: string)
	{
		return await fetch(url)
			.then(async r =>
			{
				if (r.ok)
				{
					return r.json();
				}
				else
				{
					throw await r.json();
				}
			})
			.catch(ErrorDataStore.add) as Promise<TData>;
	}

	private static async doPost<TData>(url: string, data: any)
	{
		return await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		})
			.then(async r =>
			{
				if (r.ok)
				{
					return r.json();
				}
				else
				{
					throw await r.json();
				}
			})
			.catch(ErrorDataStore.add) as Promise<TData>;
	}

	public async getGame(gameId: string)
	{
		return _Platform.doGet<GameItem>(`/api/game/get?gameId=${gameId}`);
	}

	public async createGame(ownerGuid: string, nickname: string)
	{
		_Platform.trackEvent("create");

		return _Platform.doPost<GameItem>("/api/game/create", {
			ownerGuid,
			nickname
		});
	}

	public async joinGame(playerGuid: string, gameId: string, nickname: string, isSpectating = false)
	{
		_Platform.trackEvent("join", gameId);

		return _Platform.doPost<GameItem>("/api/game/join", {
			playerGuid,
			gameId,
			nickname,
			isSpectating
		});
	}

	public async removePlayer(gameId: string, targetGuid: string, playerGuid: string)
	{
		_Platform.trackEvent("remove-player", gameId);

		return _Platform.doPost<GameItem>("/api/game/kick", {
			gameId,
			targetGuid,
			playerGuid
		});
	}

	public async startGame(ownerGuid: string, gameId: string, includedPacks: string[], includedCardcastPacks: string[], requiredRounds: number, password: string | null = null)
	{
		_Platform.trackEvent("start", gameId);

		return _Platform.doPost<GameItem>("/api/game/start", {
			gameId,
			ownerGuid,
			includedPacks,
			includedCardcastPacks,
			requiredRounds,
			password
		});
	}

	public async playCards(gameId: string, playerGuid: string, cardIds: number[])
	{
		_Platform.trackEvent("play-cards", gameId);

		return _Platform.doPost<GameItem>("/api/game/play-cards", {
			gameId,
			playerGuid,
			cardIds
		});
	}

	public async forfeit(gameId: string, playerGuid: string, playedCards: number[])
	{
		_Platform.trackEvent("my-cards-suck", gameId);

		return _Platform.doPost<GameItem>("/api/game/forfeit", {
			gameId,
			playerGuid,
			playedCards
		});
	}

	public async selectWinnerCard(gameId: string, playerGuid: string, winningPlayerGuid: string)
	{
		_Platform.trackEvent("selected-winner", gameId);

		return _Platform.doPost<GameItem>("/api/game/select-winner-card", {
			gameId,
			playerGuid,
			winningPlayerGuid
		});
	}

	public async revealNext(gameId: string, ownerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/reveal-next", {
			gameId,
			ownerGuid,
		});
	}

	public async startRound(gameId: string, ownerGuid: string)
	{
		_Platform.trackEvent("round-start", gameId);

		return _Platform.doPost<GameItem>("/api/game/start-round", {
			gameId,
			ownerGuid,
		});
	}

	public async nextRound(gameId: string, playerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/next-round", {
			gameId,
			playerGuid,
		});
	}

	public async skipBlack(gameId: string, ownerGuid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/skip-black", {
			gameId,
			ownerGuid,
		});
	}

	public async getWhiteCard(cardId: number)
	{
		return new Promise<IWhiteCard>((resolve, reject) =>
		{
			if (cardId in this.loadedWhiteCards)
			{
				resolve(this.loadedWhiteCards[cardId]);
			}
			else
			{
				_Platform.doGet<{ card: IWhiteCard }>(`/api/game/get-white-card?cardId=${cardId}`)
					.then(data =>
					{
						const card = data.card;
						this.loadedWhiteCards[cardId] = card;
						resolve(card);
					})
					.catch(e => reject(e));
			}
		})
	}

	public async getBlackCard(cardId: number)
	{
		return _Platform.doGet<IBlackCard>(`/api/game/get-black-card?cardId=${cardId}`);
	}

	public async getWhiteCards(cardIds: number[])
	{
		const promises = cardIds.map(cardId => this.getWhiteCard(cardId));

		return Promise.all(promises);
	}

	public async getPacks()
	{
		return _Platform.doGet<IPackDef[]>("/api/game/get-packnames");
	}
}

export const Platform = _Platform.Instance;
let canvas, textbox, gl, shader, batcher, assetManager, skeletonRenderer;
let mvp = new spine.Matrix4();

let lastFrameTime;
let initialLoadTimer;
let modelFrame;
let renderFrame;
let renderTimer;
let loadingResolution;
let spineData;

let customScale = 1;
let positionX = 0;
let positionY = 0;
let targetFps = 60;
let bgmfile = './assets/audio/Koi is Love.flac';
let bgmvolume = 0;
let bgm;
let bufferColor = [0.3, 0.3, 0.3];

let introAnimation, acceptingClick;
let dialogBox = false;
let currentVoiceline = 1;
let mouseSelect = -1;
let trackerID = -1;
let untrackerID = -1;
let EPointX, EPointY;
let TPoint, TEye;
let headpatOrigin;
let headpatCooldown = 0;
const headpatTarget = new spine.Vector2();
const headpatOffset = new spine.Vector2();
let flipped = false;

let transpose = 1;

let currentTracks = []; // 跟踪当前播放的音频
let interfaceLanguage = 'default';
let steamLanguage = '';
let subtitleLanguagePreference = 'auto';
window.selectedLanguage = 'English';
const subtitleLocales = {
	English: 'en',
	Chinese: 'zh-Hans',
	TraditionalChinese: 'zh-Hant',
	Japanese: 'ja',
	Korean: 'ko'
};

const CHARACTER = 'Azusa';
let modelResolution = '8k';
const HAS_A = { eye: false, point: true };

// Subtitles follow the Talk events in each Spine animation.

const AUDIO_DETAIL = [
	{
		dialog: {
			Japanese: [
				"絶対にからかってるでしょ、先生。",
				"……ま、まあ別に、心底嫌ってわけじゃないけど……。"
			],
			English: [
				"You're going to tease me again, aren't you?",
				"Well, I'm used to it. I don't mind it coming from you."
			],
			Chinese: [
				"绝对是在开玩笑吧，老师。",
				"……嘛，并，并不是从心底讨厌……。"
			],
			TraditionalChinese: [
				"你絕對在戲弄我吧，老師。",
				"……嘛，不過，也不是真的打從心底討厭……"
			],
			Korean: [
				"놀리려는 거지? 그렇지?",
				"…뭐, 그래도 선생님이라면 상관없지만…."
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"ううっ、可愛い……！",
				"この子、ずっと会いたかった……！"
			],
			English: [
				"Ugh! So cute!",
				"It's just what I've always wanted."
			],
			Chinese: [
				"嗯，好可爱……！",
				"好想一直拥有……！"
			],
			TraditionalChinese: [
				"嗯，好可愛……！",
				"好想一直擁有……！"
			],
			Korean: [
				"너무 귀여워!",
				"그게 내가 늘 원하는 거야"
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"えへっ、えへへ……えへへ……"
			],
			English: [
				"Heeheehee... Heehee..."
			],
			Chinese: [
				"（笑）"
			],
			TraditionalChinese: [
				"欸嘿，欸嘿嘿……欸嘿嘿……"
			],
			Korean: [
				"에헤헤헤헤…. 헤헤헤…."
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"っ……",
				"…そのっ、いや何でもない……。",
				"（これ以上、距離を縮めるわけにはいかないのに……）"
			],
			English: [
				"Huh?",
				"Oh, it's nothing.",
				"(I shouldn't say anything. It would only complicate things between us.)"
			],
			Chinese: [
				"啊……",
				"那个，也不是讨厌……。",
				"（不能再缩短距离了……）"
			],
			TraditionalChinese: [
				"啊……",
				"那個，也不是討厭……。",
				"（明明，不能再拉近距離了……）"
			],
			Korean: [
				"응?",
				"아, 아무 것도 아냐.",
				"(….말하지 않을 거야. 선생님을 곤란하게 하진 않을 거니까.)"
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"でも、先生がどうしてこんな可愛い場所を……？",
				"……先生も好き？本当に？"
			],
			English: [
				"So where did you learn about this kind of place?",
				"You saw it on a whim? I didn't expect you to like these sorts of things."
			],
			Chinese: [
				"但是，老师为什么在这么可爱的地方……？",
				"……老师也喜欢吗？真的吗？"
			],
			TraditionalChinese: [
				"不過，老師怎麼會知道這種可愛的地方？",
				"……老師也喜歡？真的嗎？"
			],
			Korean: [
				"그런데 어떻게 이런 귀여운 장소를 알고 있는 거야?",
				"좋아한다고? 정말로?"
			]
		}
	},
	{
		dialog: {
			Japanese: [
				"子ども扱いして、合わせたりしてない？",
				"……まあ、別にどっちでも良いけど。"
			],
			English: [
				"And don't treat me like a child!",
				"Not that it matters at this point."
			],
			Chinese: [
				"老师是不是把我当小孩子，在迁就我？",
				"……嘛，不管怎么样都可以啦。"
			],
			TraditionalChinese: [
				"沒有把我當小孩子，在附和我吧？",
				"……嘛，其實怎樣都無所謂。"
			],
			Korean: [
				"지금 날 아이 취급하는 거야?",
				"뭐…… 딱히 상관없지만."
			]
		}
	}
];


const HITBOX = {
	headpat: { xMin: 920, xMax: 1410, yMin: -100, yMax: 300 },
	voiceline: { xMin: 880, xMax: 1670, yMin: 650, yMax: 1500 }
};

const INTRO_TIMEOUT = 19500;
const HEADPAT_CLAMP = 30;
const HEADPAT_DRAG_SCALE = 0.35;
const HEADPAT_FOLLOW_TIME = 0.055;
const HEADPAT_RETURN_TIME = 0.08;
const EYE_CLAMP_X = 200;
const EYE_CLAMP_Y = EYE_CLAMP_X * (9 / 16);
const EYE_STEP = 10;

let mousePos = { x: 0, y: 0 };
let volume = 0.5;
let mouseOptions = { voicelines: true, headpatting: true, mousetracking: true, drawHitboxes: false };

// Helper clamp function. Math does not appear to have clamp() in this version.
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

// NOTE: X and Y appears to be inversely related from cursor position to bone adjustment.
//       This behavior's reason is unknown, but it LOOKS right so leave it alone!
function trackMouse() {
	let adjX = (mousePos.x / canvas.width) - 0.5;
	let adjY = (mousePos.y / canvas.height) - 0.5;
	TEye.y = TEye.y - (Math.sign(adjX) * EYE_STEP);
	TEye.x = TEye.x - (Math.sign(adjY) * EYE_STEP);
	TEye.y = clamp(TEye.y, EPointY - (Math.abs(adjX) * EYE_CLAMP_X), EPointY + (Math.abs(adjX) * EYE_CLAMP_X));
	TEye.x = clamp(TEye.x, EPointX - (Math.abs(adjY) * EYE_CLAMP_Y), EPointX + (Math.abs(adjY) * EYE_CLAMP_Y));
}

function untrackMouse() {
	if (Math.abs(TEye.y - EPointY) <= EYE_STEP && Math.abs(TEye.x - EPointX) <= EYE_STEP) {
		if (untrackerID != -1) {
			TEye.y = EPointY;
			TEye.x = EPointX;
			clearInterval(untrackerID);
			untrackerID = -1;
			setTimeout(function () {
				acceptingClick = true;
			}, 500);
		}
	}
	if (TEye.y > EPointY) TEye.y -= EYE_STEP;
	if (TEye.y < EPointY) TEye.y += EYE_STEP;
	if (TEye.x > EPointX) TEye.x -= EYE_STEP;
	if (TEye.x < EPointX) TEye.x += EYE_STEP;
}

function applyHeadpat(delta) {
	const dx = headpatTarget.x - headpatOffset.x;
	const dy = headpatTarget.y - headpatOffset.y;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
		headpatOffset.set(headpatTarget.x, headpatTarget.y);
	} else {
		const blend = 1 - Math.exp(-delta / (headpatOrigin ? HEADPAT_FOLLOW_TIME : HEADPAT_RETURN_TIME));
		headpatOffset.x += dx * blend;
		headpatOffset.y += dy * blend;
	}
	TPoint.x += headpatOffset.x;
	TPoint.y += headpatOffset.y;
}

function releaseHeadpatOnExit() {
	if (headpatOrigin && spineData) releasedMouse();
}

function playVoiceline() {
	const state = spineData.state;
	const animationName = `Talk_0${currentVoiceline}`;
	const { dialog } = AUDIO_DETAIL[currentVoiceline - 1];
	const motion = state.setAnimation(1, `${animationName}_M`, false);
	const expression = state.setAnimation(2, `${animationName}_A`, false);
	state.addEmptyAnimation(1, 0.5, motion.animationEnd);
	state.addEmptyAnimation(2, 0.5, expression.animationEnd);

	const cues = motion.animation.timelines
		.flatMap(timeline => timeline.events || [])
		.filter(event => event.data.name === 'Talk');
	const clips = new Map(cues.map((event, index) => {
		const filename = CHARACTER + event.stringValue.slice(CHARACTER.length).toLowerCase();
		const track = new Audio(`./assets/audio/${filename}.ogg`);
		track.preload = 'auto';
		track.volume = volume;
		return [event, { track, dialog, index }];
	}));

	acceptingClick = false;
	motion.listener = {
		event: (_entry, event) => {
			const clip = clips.get(event);
			if (!clip) return;
			const { track, index } = clip;
			currentTracks.push(clip);
			const finish = () => {
				if (!currentTracks.includes(clip)) return;
				currentTracks = currentTracks.filter(active => active !== clip);
				if (!currentTracks.length) textbox.style.opacity = 0;
			};
			track.addEventListener('ended', finish, { once: true });
			track.play().catch(finish);

			if (dialogBox) {
				textbox.textContent = dialog[window.selectedLanguage][index];
				textbox.style.opacity = 1;
			}
		},
		complete: () => {
			acceptingClick = true;
			currentVoiceline = currentVoiceline % AUDIO_DETAIL.length + 1;
		}
	};
}

// Hitbox Scaling
function t(n, side) {
	let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } }
	n = d[side].mid - n;
	n = (d[side].length / (transpose * 2)) - n;
	n = (n - (d[side].length / (transpose * 2))) / customScale;
	return (n + (d[side].length / (transpose * 2))) * transpose;
}

// -1 = [No Entry], 1 = Headpat, 2 = Voiceline, 3 = Eye Track
function pressedMouse(x, y) {
	tx = t(x, 'x');
	ty = t(y, 'y');
	if (tx > HITBOX.headpat.xMin && tx < HITBOX.headpat.xMax && ty > HITBOX.headpat.yMin && ty < HITBOX.headpat.yMax && mouseOptions.headpatting) {
		spineData.state.setAnimation(1, 'Pat_01_M', false);
		if (HAS_A.point) spineData.state.setAnimation(2, 'Pat_01_A', false);
		headpatOrigin = { x, y };
		mouseSelect = 1;
	}
	else if (tx > HITBOX.voiceline.xMin && tx < HITBOX.voiceline.xMax && ty > HITBOX.voiceline.yMin && ty < HITBOX.voiceline.yMax && mouseOptions.voicelines) {
		mouseSelect = 2;
	}
	else if (mouseOptions.mousetracking) {
		if (trackerID == -1) {
			trackerID = setInterval(trackMouse, 20);
		}
		spineData.state.setEmptyAnimation(1, 0);
		spineData.state.setEmptyAnimation(2, 0);
		let eyetracking = spineData.state.addAnimation(1, 'Look_01_M', false, 0);
		eyetracking.mixDuration = 0.2;
		if (HAS_A.eye) {
			let eyetracking2 = spineData.state.addAnimation(2, 'Look_01_A', false, 0);
			eyetracking2.mixDuration = 0.2;
		}
		mousePos.x = x;
		mousePos.y = y;
		mouseSelect = 3;
	}
	else if (mouseSelect == -1) {
		acceptingClick = true;
	}
}

function drawHitboxes() {
	if (!overlay || !overlay.getContext) return;
	const ctx = overlay.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, overlay.width, overlay.height);
	if (!mouseOptions.drawHitboxes) return;

	
	ctx.save();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'red';
	ctx.globalAlpha = 0.5;

	function worldToScreen(n, side) {
		let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } };
		n = (n / transpose) - (d[side].length / (transpose * 2));
		n = n * customScale + (d[side].length / (transpose * 2));
		n = (d[side].length / (transpose * 2)) - n;
		const offset = side === 'x' ? canvas.width * positionX : canvas.height * positionY;
		return d[side].mid - n + offset;
	}

	for (const key in HITBOX) {
		const box = HITBOX[key];
		const x1 = worldToScreen(box.xMin, 'x');
		const y1 = worldToScreen(box.yMin, 'y');
		const x2 = worldToScreen(box.xMax, 'x');
		const y2 = worldToScreen(box.yMax, 'y');
		const width = x2 - x1;
		const height = y1 - y2;
		ctx.strokeRect(x1, y2, width, height);
	}

	ctx.restore();
}

function movedMouse(x, y) {
	switch (mouseSelect) {
		case 1: {
			const scale = HEADPAT_DRAG_SCALE * transpose / customScale;
			const parent = TPoint.parent;
			headpatTarget.set(
				parent.worldX + (x - headpatOrigin.x) * scale,
				parent.worldY + (headpatOrigin.y - y) * scale
			);
			parent.worldToLocal(headpatTarget);
			const distance = headpatTarget.length();
			if (distance > HEADPAT_CLAMP) {
				headpatTarget.x *= HEADPAT_CLAMP / distance;
				headpatTarget.y *= HEADPAT_CLAMP / distance;
			}
			break;
		}
		case 2:
			mouseSelect = -1;
			acceptingClick = true;
			break;
		case 3:
			mousePos.x = x;
			mousePos.y = y;
			break;
		default:
	}
}

function releasedMouse() {
	switch (mouseSelect) {
		case 1: {
			headpatOrigin = null;
			headpatTarget.set(0, 0);
			const state = spineData.state;
			const motion = state.setAnimation(1, 'PatEnd_01_M', false);
			const expression = state.setAnimation(2, 'PatEnd_01_A', false);
			state.addEmptyAnimation(1, 0.5, motion.animationEnd);
			state.addEmptyAnimation(2, 0.5, expression.animationEnd);
			headpatCooldown = setTimeout(() => {
				headpatCooldown = 0;
				acceptingClick = true;
			}, 500);
			break;
		}
		case 2:
			playVoiceline();
			break;
		case 3:
			if (trackerID != -1) {
				clearInterval(trackerID);
				trackerID = -1;
			}
			if (untrackerID == -1) {
				untrackerID = setInterval(untrackMouse, 20);
			}
			let eyetracking = spineData.state.setAnimation(1, 'LookEnd_01_M', false);
			let eyetracking2 = spineData.state.setAnimation(2, 'LookEnd_01_A', false);
			eyetracking.mixDuration = 0;
			eyetracking2.mixDuration = 0;
			spineData.state.addEmptyAnimation(1, 0.5, 0);
			spineData.state.addEmptyAnimation(2, 0.5, 0);
			break;
		default:
	}
	mouseSelect = -1;
}

// adjusts mouse values for flipped canvas
function setMouse(event) {
	let ax = event.clientX;
	let ay = event.clientY;
	if (flipped) {
		ax = canvas.width - ax;
	}

	return { x: ax - canvas.width * positionX, y: ay - canvas.height * positionY };
}

function updateSubtitleLanguage() {
	let language = subtitleLanguagePreference;
	if (language === 'auto') {
		const locale = interfaceLanguage === 'default' ? steamLanguage : interfaceLanguage;
		const [primary, region] = locale.split(/[-_]/);
		if (primary === 'tchinese' || (primary === 'zh' && ['cht', 'hant', 'tw', 'hk', 'mo'].includes(region))) {
			language = 'TraditionalChinese';
		} else if (primary === 'schinese' || primary === 'zh') {
			language = 'Chinese';
		} else if (primary === 'ja' || primary === 'japanese') {
			language = 'Japanese';
		} else if (primary === 'ko' || primary === 'korean' || primary === 'koreana') {
			language = 'Korean';
		} else {
			language = 'English';
		}
	}

	if (language === window.selectedLanguage) return;
	window.selectedLanguage = language;
	textbox.lang = subtitleLocales[language];
	const clip = currentTracks.at(-1);
	if (dialogBox && clip) textbox.textContent = clip.dialog[language][clip.index];
	window.dispatchEvent(new Event('languageChange'));
}

function init() {
	// Wallpaper Engine settings
	window.wallpaperPropertyListener = {
		applyGeneralProperties: (props) => {
			const language = props.language?.value ?? props.language;
			const steamLocale = props.steamlanguage?.value ?? props.steamlanguage;
			if (typeof language !== 'string' && typeof steamLocale !== 'string') return;
			if (typeof language === 'string') interfaceLanguage = language.toLowerCase();
			if (typeof steamLocale === 'string') steamLanguage = steamLocale.toLowerCase();
			updateSubtitleLanguage();
		},
		applyUserProperties: (props) => {
			if (props.schemecolor) {
				bufferColor = props.schemecolor.value.split(" ");
			}
			if (props.alignmentfliph) flipped = props.alignmentfliph.value;
			if (props.scale) {
				customScale = props.scale.value;
				document.documentElement.style.setProperty('--wallpaper-scale', customScale);
			}
			if (props.positionx) {
				positionX = props.positionx.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-x', props.positionx.value + 'vw');
			}
			if (props.positiony) {
				positionY = props.positiony.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-y', props.positiony.value + 'vh');
			}
			if (props.scale || props.positionx || props.positiony) resize();
			if (props.targetfps) targetFps = props.targetfps.value;

			if (props.introanimation) introAnimation = props.introanimation.value;

			if (props.mousetracking) mouseOptions.mousetracking = props.mousetracking.value;
			if (props.headpatting) mouseOptions.headpatting = props.headpatting.value;
			if (props.voicelines) mouseOptions.voicelines = props.voicelines.value;
			if (props.voicevolume) volume = props.voicevolume.value / 100;
			if (props.showdialog) dialogBox = props.showdialog.value;
			if (props.dialogx) textbox.style.left = props.dialogx.value + '%';
			if (props.dialogy) textbox.style.top = props.dialogy.value + '%';
			if (props.drawHitboxes) mouseOptions.drawHitboxes = props.drawHitboxes.value;

			// 监听模型分辨率设置
			if (props.modelresolution) modelResolution = props.modelresolution.value;
			if (assetManager && typeof introAnimation !== 'undefined' && !modelFrame &&
				(props.modelresolution || loadingResolution !== modelResolution)) {
				reloadModel();
			}


			if (props.dialoglanguage) {
				const language = props.dialoglanguage.value;
				subtitleLanguagePreference = Object.hasOwn(subtitleLocales, language) ? language : 'auto';
				updateSubtitleLanguage();
			}
			// 添加introDialog属性处理
			if (props.introDialogX) introDialogX = props.introDialogX.value;
			if (props.introDialogY) introDialogY = props.introDialogY.value;

			// 如果当前正在显示intro对话框，实时更新位置
			if (introAnimation && textbox.style.opacity === '1' &&
				introAudioIsPlaying && dialogBox) {
				textbox.style.left = introDialogX + '%';
				textbox.style.top = introDialogY + '%';
			}

			if (props.bgmfile) {
				bgmfile = 'file:///' + props.bgmfile.value.replace("%3A", "\:");
			}
			if (props.bgmvolume) {
				bgmvolume = props.bgmvolume.value / 100;
				if (bgm) bgm.volume = bgmvolume;
			}
		},
		setPaused: function(isPaused) {
				if (bgm) {
					if (isPaused) {
						setTimeout(() => { bgm.volume = 0; }, 200);
					} else {
						setTimeout(() => { bgm.volume = bgmvolume; }, 200);
					}
				}
			}
	};

	textbox = document.getElementById('textbox');
	textbox.lang = subtitleLocales[window.selectedLanguage];

	canvas = document.getElementById('canvas');
	canvas.addEventListener('mouseleave', releaseHeadpatOnExit);
	window.addEventListener('blur', releaseHeadpatOnExit);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	overlay = document.getElementById('overlay');
	overlay.width = window.innerWidth;
	overlay.height = window.innerHeight;

	let config = { alpha: false, premultipliedAlpha: false, antialias: true };
	gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
	if (!gl) {
		alert('WebGL is unavailable.');
		return;
	}

	// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
	shader = spine.Shader.newTwoColoredTextured(gl);
	batcher = new spine.PolygonBatcher(gl);
	mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
	skeletonRenderer = new spine.SkeletonRenderer(gl);
	assetManager = new spine.AssetManager(gl);

	initialLoadTimer = setTimeout(() => {
		if (typeof introAnimation === 'undefined') introAnimation = true;
		if (loadingResolution === undefined && !modelFrame) reloadModel();
	}, 350);

	window.addEventListener('resize', resize);
	window.addEventListener('pagehide', event => {
		if (event.persisted) return;
		canvas.style.visibility = 'hidden';
		clearTimeout(initialLoadTimer);
		cancelAnimationFrame(modelFrame);
		cancelAnimationFrame(renderFrame);
		clearTimeout(renderTimer);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	});
}

let introAudioIsPlaying = false;
let introAudioTracks = [];
let introTimeouts = [];

// Function to reload the model with a new resolution
function reloadModel() {
	if (!assetManager || modelFrame) return;
	if (mouseSelect === 1 || headpatCooldown) {
		if (mouseSelect === 1) mouseSelect = -1;
		acceptingClick = false;
	}
	clearTimeout(headpatCooldown);
	headpatCooldown = 0;
	headpatOrigin = null;
	headpatTarget.set(0, 0);
	headpatOffset.set(0, 0);

	// Stop the current BGM if it's playing
	if (bgm) {
		bgm.pause();
		bgm = null;
	}
	
	// Stop all intro audio and clear related timeouts
	introAudioIsPlaying = false;
	
	// Stop and clear all intro audio tracks
	introAudioTracks.forEach(track => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	introAudioTracks = [];
	
	// Stop and clear all voiceline audio tracks
	currentTracks.forEach(({ track }) => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	currentTracks = [];
	
	// Clear all intro timeouts
	introTimeouts.forEach(timeout => clearTimeout(timeout));
	introTimeouts = [];
	
	
	// Hide dialog box
	if (textbox) {
		textbox.style.opacity = 0;
	}
	
	canvas.style.visibility = 'hidden';
	cancelAnimationFrame(renderFrame);
	clearTimeout(renderTimer);
	spineData = null;
	assetManager.removeAll();
	loadingResolution = modelResolution;
	const binaryPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.skel`, document.baseURI).href;
	const atlasPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.atlas`, document.baseURI).href;
	assetManager.loadBinary(binaryPath);
	assetManager.loadTextureAtlas(atlasPath);
	function waitForAssets() {
		if (!assetManager.isLoadingComplete()) {
			modelFrame = requestAnimationFrame(waitForAssets);
			return;
		}
		modelFrame = 0;
		if (loadingResolution !== modelResolution) {
			reloadModel();
			return;
		}
		if (assetManager.get(binaryPath) && assetManager.get(atlasPath)) {
			load(binaryPath, atlasPath);
		} else {
			console.error('Model assets not found for resolution: ' + loadingResolution);
			loadingResolution = undefined;
		}
	}
	modelFrame = requestAnimationFrame(waitForAssets);
}

// CITATION: http://esotericsoftware.com/spine-api-reference#
// CITATION: http://en.esotericsoftware.com/forum/Spine-Unity-Making-the-arm-follow-the-mouse-7856
let modelMouseHandlersBound = false;

function interactionLoad() {
	// Touch_Point and Touch_Eye
	TPoint = spineData.skeleton.findBone('Touch_Point');
	TEye = spineData.skeleton.findBone('Touch_Eye');
	EPointX = TEye.x;
	EPointY = TEye.y;

	if (!modelMouseHandlersBound) {
		modelMouseHandlersBound = true;
		downaction = canvas.addEventListener('mousedown', function (event) {
			if (!acceptingClick) {
				return;
			}
			acceptingClick = false;
			let mouseData = setMouse(event);
			pressedMouse(mouseData.x, mouseData.y);
		});
		upaction = canvas.addEventListener('mouseup', function () {
			releasedMouse();
		});
		moveaction = canvas.addEventListener('mousemove', function (event) {
			let mouseData = setMouse(event);
			movedMouse(mouseData.x, mouseData.y);
		});
	}

	if (!introAnimation) {
		acceptingClick = true;
	}
	else {
		setTimeout(function () {
			acceptingClick = true;
		}, INTRO_TIMEOUT);
	}

	return 1;
}

function load(dynamicBinaryPath, dynamicAtlasPath) {
	spineData = loadSpineData(dynamicBinaryPath, dynamicAtlasPath, false);

	// User Option to skip Intro Animation
        if (introAnimation) {
            spineData.state.addAnimation(0, 'Start_Idle_01', false);

            if (mouseOptions.voicelines) {
                // 清理之前的音频和超时
                introAudioTracks.forEach(track => {
                    if (!track.paused) {
                        track.pause();
                    }
                });
                introAudioTracks = [];
                introTimeouts.forEach(timeout => clearTimeout(timeout));
                introTimeouts = [];

                // 保存当前从project.json获取的文本框位置
                const originalPosition = {
                    left: textbox.style.left,
                    top: textbox.style.top
                };

                const introAudioDetail = {
                    count: 3,
                    startTimes: [3200, 7200, 12100],
                    dialog: {
                        Japanese: [
                            "可愛いのは何も悪くないけど！",
                            "可愛いぬいぐるみがいっぱいなのは良いけど！！",
                            "……何だか恥ずかしい。"
                        ],
                        English: [
                            "I guess they are kind of cute!",
                            "I've never seen so many cute plushes!",
                            "Th-This is so embarrassing..."
                        ],
                        Chinese: [
                            "可爱的也没什么不好",
                            "有一堆可爱的玩偶也很好",
                            "只是不知道为什么...好害羞"
                        ],
                        TraditionalChinese: [
                            "可愛的也沒什麼不好",
                            "有一堆可愛的玩偶也很好",
                            "只是不知道為什麼...好害羞"
                        ],
                        Korean: [
                            "예쁜 것 같아요!",
                            "이렇게 귀여운 붓을 본 적 없어!",
                            "이건 너무 어색해..."
                        ]
                    },
                    dialogPosition: {
                        x: introDialogX,
                        y: introDialogY
                    }
                };

                for (let i = 0; i < introAudioDetail.count; i++) {
                    let track = new Audio(`./assets/audio/${CHARACTER}_memoriallobby_0_${(i + 1)}.ogg`);
                    track.volume = volume;
                    introAudioTracks.push(track);

                    const timeout1 = setTimeout(function () {
                        if (dialogBox) {
                            introAudioIsPlaying = true;
                            textbox.style.left = introDialogX + '%';
                            textbox.style.top = introDialogY + '%';
                        }
                    }, introAudioDetail.startTimes[i] - 1000);
                    introTimeouts.push(timeout1);

                    const timeout2 = setTimeout(function () {
                        if (track && !track.paused) {
                            track.pause();
                        }
                        track.play();
                        if (dialogBox) {
                            const selectedLanguage = window.selectedLanguage || 'Japanese';
                            textbox.innerHTML = introAudioDetail.dialog[selectedLanguage][i];
                            textbox.style.opacity = 1;

                            // 添加语言切换监听
                            const updateText = () => {
                                const currentLanguage = window.selectedLanguage || 'Japanese';
                                textbox.innerHTML = introAudioDetail.dialog[currentLanguage][i];
                            };
                            window.addEventListener('languageChange', updateText);

                            track.addEventListener('ended', function () {
                                textbox.style.opacity = 0;
                                window.removeEventListener('languageChange', updateText);

                                if (i === introAudioDetail.count - 1) {
                                    const timeout3 = setTimeout(function () {
                                        introAudioIsPlaying = false;
                                        textbox.style.left = originalPosition.left;
                                        textbox.style.top = originalPosition.top;
                                    }, 1000);
                                    introTimeouts.push(timeout3);
                                }
                            });
                        }
                    }, introAudioDetail.startTimes[i]);
                    introTimeouts.push(timeout2);
                }
            }
        }

	spineData.state.addAnimation(0, 'Idle_01', true, 0);

	interactionLoad();
	resize();

	// Plays user-defined BGM (if set)
	if (!bgm) {
		bgm = new Audio(bgmfile);
		bgm.volume = bgmvolume;
		bgm.loop = true;
		bgm.play();
		bgm.addEventListener('ended', function () {
			this.currentTime = 0;
			this.play();
		}, false);
	}

	lastFrameTime = Date.now() / 1000;
	// Call render every frame.
	render();
	canvas.style.visibility = 'visible';
}

const GLARE_SLOTS = new Set([
	"Lensflare", "T_Hardlight"
]);
const GLARE_OPACITY = 0.55;

// Scale attachment opacity once so animated slot colors still control the light.
function applyGlareOpacity(skeletonData) {
	for (const skin of skeletonData.skins) {
		for (const { slotIndex, attachment } of skin.getAttachments()) {
			const slot = skeletonData.slots[slotIndex];
			if (!GLARE_SLOTS.has(slot.name) || slot.blendMode !== 1 || !attachment.color) continue;
			attachment.color.a *= GLARE_OPACITY;
		}
	}
}

function loadSpineData(binaryPath, atlasPath, premultipliedAlpha) {
	// Load the texture atlas from the AssetManager.
	let atlas = assetManager.get(atlasPath);

	// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonBinary instance for parsing the .skel file.
	let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	skeletonBinary.scale = 1;
	let skeletonData = skeletonBinary.readSkeletonData(assetManager.get(binaryPath));
	applyGlareOpacity(skeletonData);
	let skeleton = new spine.Skeleton(skeletonData);
	let bounds = calculateSetupPoseBounds(skeleton);

	// Create an AnimationState, and set the initial animation in looping mode.
	let animationStateData = new spine.AnimationStateData(skeleton.data);
	animationStateData.defaultMix = 0.5;
	let animationState = new spine.AnimationState(animationStateData);

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
}

function calculateSetupPoseBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform(spine.Physics.update);
	let offset = new spine.Vector2();
	let size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}

function render() {
    let now = Date.now() / 1000;
    let delta = now - lastFrameTime;

    lastFrameTime = now;

    gl.clearColor(bufferColor[0], bufferColor[1], bufferColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Only render if spineData is available
    if (spineData) {
        // Apply the animation state based on the delta time.
        let skeleton = spineData.skeleton;
        let state = spineData.state;
        let premultipliedAlpha = spineData.premultipliedAlpha;
        state.update(delta);
        state.apply(skeleton);
        const pointX = TPoint.x;
        const pointY = TPoint.y;
        applyHeadpat(delta);
        skeleton.updateWorldTransform(spine.Physics.update);
        TPoint.x = pointX;
        TPoint.y = pointY;

        // Bind the shader and set the texture and model-view-projection matrix.
        shader.bind();
        // 修改这两行，从 spine.webgl.Shader 改为 spine.Shader
        shader.setUniformi(spine.Shader.SAMPLER, 0);
        shader.setUniform4x4f(spine.Shader.MVP_MATRIX, mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        batcher.begin(shader);
        skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        skeletonRenderer.draw(batcher, skeleton);
        batcher.end();

        shader.unbind();
    }

    // throttle fps
	let elapsed = Date.now() / 1000 - now;
	let targetFrameTime = 1 / targetFps;
	let delay = Math.max(targetFrameTime - elapsed, 0) * 1000;

	drawHitboxes();

	renderTimer = setTimeout(() => {
		renderFrame = requestAnimationFrame(render);
	}, delay);
}

function resize() {
	let w = canvas.clientWidth;
	let h = canvas.clientHeight;
	if (w === 0 || h === 0) return;
	if (canvas.width != w || canvas.height != h) {
		canvas.width = w;
		canvas.height = h;
		overlay.width = w;
		overlay.height = h;
	}

	// Set values to position skeleton to center of canvas.
	// Will always attempt to Fit to Fill while maintaining aspect ratio. As a result, a scale of [1] will mean different things across various device resolutions.
	let centerX = 0;
	let centerY = 900;
	let wr = canvas.width / 2560;
	let hr = canvas.height / 1600;
	let width = (2560 / customScale);
	let height = (1600 / customScale);

	if (wr < hr) {
		width = height * (canvas.width / canvas.height);

		transpose = 1600 / canvas.height;
	}
	else if (wr > hr) {
		height = width * (canvas.height / canvas.width);

		transpose = 2560 / canvas.width;
	}
	else {
		transpose = 1600 / canvas.height;
	}

	mvp.ortho2d(centerX - width / 2 - positionX * width, centerY - height / 2 + positionY * height, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}

init();

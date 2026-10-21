class RJMTurtle {
    constructor() {
        this.block = "1";
        this.nib = [[0,0,0]];
        this.pos = [0,0,0];
        this.penDown = true;
        this.matrix = null;
        this.TO_RADIANS = Math.PI / 180;
    }
    
    clone() {
        var t = new RJMTurtle();
        t.block = this.block;
        t.nib = this.nib;
        t.pos = this.pos;
        t.penDown = this.penDown;
        t.matrix = this.matrix;
        return t;
    }
    
    mmMultiply(a,b) {
        var c = [[0,0,0],[0,0,0],[0,0,0]];
        for (var i = 0; i < 3 ; i++) for (var j = 0; j < 3 ; j++)
          c[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
        return c;
    };
    
    mod(n,m) {
        return ((n%m)+m)%m;
    };
    
    cosDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [1,0,-1,0][this.mod(angle,360)/90];
        }
        else {
            return Math.cos(angle * this.TO_RADIANS);
        }
    }
    
    sinDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [0,1,0,-1][this.mod(angle,360)/90];
        }
        else {
            return Math.sin(angle * this.TO_RADIANS);
        }
    }
    
    yawMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, 0, -s],
                [0, 1, 0],
                [s, 0, c]];
    };
    
    rollMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, -s, 0],
                [s,  c, 0],
                [0,  0, 1]];
    };
    
    pitchMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[1, 0, 0],
                [0, c, s],
                [0,-s, c]];
    };
}

class RaspberryJamMod {
    constructor(runtime) {
        this.clear();
    }
    
    clear() {
        this.socket = null;
        this.hits = [];
        this.turtle = new RJMTurtle();
        this.turtleHistory = [];
        this.savedBlocks = null;
    }
    
    getInfo() {
        return {
            "id": "RaspberryJamMod",
            "name": "マインクラフト",
            
            "blocks": [{
                    "opcode": "connect_p",
                    "blockType": "command",
                    "text": "Minecraftに接続 [ip]",
                    "arguments": {
                        "ip": {
                            "type": "string",
                            "defaultValue": "localhost"
                        },
                    }
            },
            {
                    "opcode": "chat",
                    "blockType": "command",
                    "text": "チャットに [msg] を送る",
                    "arguments": {
                        "msg": {
                            "type": "string",
                            "defaultValue": "Hello, World!"
                        },
                    }
            },            
            {
                    "opcode": "blockByName",
                    "blockType": "reporter",
                    "text": "[name] のブロックID",
                    "arguments": {
                        "name": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
            {
                    "opcode": "getBlock",
                    "blockType": "reporter",
                    "text": "座標 ([x],[y],[z]) のブロックID",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },             
/*            {
                    "opcode": "haveBlock",
                    "blockType": "Boolean",
                    "text": "have [b] at ([x],[y],[z])",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        },
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },             */
            /* {
                    "opcode": "onBlock",
                    "blockType": "Boolean",
                    "text": "player on [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "0,0",
                            "menu": "blockMenu"
                        },
                    }
            }, */
            {
                    "opcode": "getPlayerX",
                    "blockType": "reporter",
                    "text": "プレイヤーのX座標 [mode]",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerY",
                    "blockType": "reporter",
                    "text": "プレイヤーのY座標 [mode]",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerZ",
                    "blockType": "reporter",
                    "text": "プレイヤーのZ座標 [mode]",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getPlayerVector",
                    "blockType": "reporter",
                    "text": "プレイヤーの座標ベクトル [mode]",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getHit",
                    "blockType": "reporter",
                    "text": "剣で当たった座標",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "extractFromVector",
                    "blockType": "reporter",
                    "text": "ベクトル [vector] の [coordinate] 座標",
                    "arguments": {
                        "coordinate": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "coordinateMenu"
                        },
                        "vector": {
                            "type": "string",
                            "defaultValue": "0,0,0",
                        },
                    }
            },          
            {
                    "opcode": "makeVector",
                    "blockType": "reporter",
                    "text": "ベクトル ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                    }
            },                
            {
                    "opcode": "setBlock",
                    "blockType": "command",
                    "text": "座標 ([x],[y],[z]) に [b] を置く",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        },
                    }
            },            
/*            {
                    "opcode": "setBlock",
                    "blockType": "command",
                    "text": "put block with id [b] at ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0"
                        },
                    }
            },       */      
            {
                    "opcode": "setPlayerPos",
                    "blockType": "command",
                    "text": "プレイヤーを ([x],[y],[z]) に移動",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "movePlayer",
                    "blockType": "command",
                    "text": "プレイヤーを ([dx],[dy],[dz]) だけ移動",
                    "arguments": {
                        "dx": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "dy": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "dz": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },         
            {
                    "opcode": "movePlayerTop",
                    "blockType": "command",
                    "text": "プレイヤーを一番上に移動",
                    "arguments": {
                    }
            },         
            {
                    "opcode": "spawnEntity",
                    "blockType": "command",
                    "text": "座標 ([x],[y],[z]) に [entity] を出現させる",
                    "arguments": {
                        "entity": {
                            "type": "string",
                            "defaultValue": "Villager",
                            "menu": "entityMenu"
                        },
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },
            {
                    "opcode": "moveTurtle",
                    "blockType": "command",
                    "text": "タートルを [dir] に [n] 移動",
                    "arguments": {
                        "dir": {
                            "type": "number",
                            "menu": "moveMenu",
                            "defaultValue": 1
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                    }
            },            
            {
                    "opcode": "leftTurtle",
                    "blockType": "command",
                    "text": "タートルを左に [n] 度回す",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "rightTurtle",
                    "blockType": "command",
                    "text": "タートルを右に [n] 度回す",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "turnTurtle",
                    "blockType": "command",
                    "text": "タートルを [dir] 方向に [n] 度回す",
                    "arguments": {
                        "dir": {
                            "type": "string",
                            "menu": "turnMenu",
                            "defaultValue": "pitch"
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "pen",
                    "blockType": "command",
                    "text": "タートルのペンを [state] にする",
                    "arguments": {
                        "state": {
                            "type": "number",
                            "defaultValue": 1,
                            "menu": "penMenu"
                        }
                    }
            },            
            {
                    "opcode": "turtleBlock",
                    "blockType": "command",
                    "text": "タートルのペンのブロックを [b] にする",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
/*            {
                    "opcode": "turtleBlock",
                    "blockType": "command",
                    "text": "turtle pen block with id [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                        }
                    }
            },             */
            {
                    "opcode": "turtleThickness",
                    "blockType": "command",
                    "text": "タートルのペンの太さを [n] にする",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": 1,
                        }
                    }
            },            
            {
                    "opcode": "setTurtlePosition",
                    "blockType": "command",
                    "text": "タートルを ([x],[y],[z]) に移動",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "resetTurtleAngle",
                    "blockType": "command",
                    "text": "タートルの向きを [n] 度にリセット",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },            
            {
                    "opcode": "saveTurtle",
                    "blockType": "command",
                    "text": "タートルの状態を保存",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "restoreTurtle",
                    "blockType": "command",
                    "text": "タートルの状態を復元",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "suspend",
                    "blockType": "command",
                    "text": "描画を一時停止",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "resume",
                    "blockType": "command",
                    "text": "描画を再開",
                    "arguments": {
                    }
            },            
            ],
        "menus": {
            moveMenu: [{text:"前進",value:1}, {text:"後退",value:-1}],
            penMenu: [{text:"下ろす",value:1}, {text:"上げる",value:0}],
            coordinateMenu: [{text:"X",value:0}, {text:"Y",value:1}, {text:"Z",value:2}],
            turnMenu: [{text:"ヨー（左右）",value:"yaw"}, {text:"ピッチ（上下）",value:"pitch"}, {text:"ロール（回転）",value:"roll"}],
            modeMenu: [{text:"正確に",value:1},{text:"ブロック単位",value:0}],
            entityMenu: [{text:"アイテム",value:"Item"},
                {text:"経験値オーブ",value:"XPOrb"},
                {text:"リードの結び目",value:"LeashKnot"},
                {text:"絵画",value:"Painting"},
                {text:"矢",value:"Arrow"},
                {text:"雪玉",value:"Snowball"},
                {text:"ファイヤーボール",value:"Fireball"},
                {text:"小さいファイヤーボール",value:"SmallFireball"},
                {text:"エンダーパール",value:"ThrownEnderpearl"},
                {text:"エンダーアイ",value:"EyeOfEnderSignal"},
                {text:"投げたポーション",value:"ThrownPotion"},
                {text:"投げた経験値瓶",value:"ThrownExpBottle"},
                {text:"額縁",value:"ItemFrame"},
                {text:"ウィザーの頭蓋骨",value:"WitherSkull"},
                {text:"点火されたTNT",value:"PrimedTnt"},
                {text:"落下する砂",value:"FallingSand"},
                {text:"花火",value:"FireworksRocketEntity"},
                {text:"アーマースタンド",value:"ArmorStand"},
                {text:"ボート",value:"Boat"},
                {text:"トロッコ",value:"MinecartRideable"},
                {text:"チェスト付きトロッコ",value:"MinecartChest"},
                {text:"かまど付きトロッコ",value:"MinecartFurnace"},
                {text:"TNTトロッコ",value:"MinecartTNT"},
                {text:"ホッパー付きトロッコ",value:"MinecartHopper"},
                {text:"モブスポナー付きトロッコ",value:"MinecartSpawner"},
                {text:"コマンドブロック付きトロッコ",value:"MinecartCommandBlock"},
                {text:"モブ",value:"Mob"},
                {text:"モンスター",value:"Monster"},
                {text:"クリーパー",value:"Creeper"},
                {text:"スケルトン",value:"Skeleton"},
                {text:"クモ",value:"Spider"},
                {text:"巨人",value:"Giant"},
                {text:"ゾンビ",value:"Zombie"},
                {text:"スライム",value:"Slime"},
                {text:"ガスト",value:"Ghast"},
                {text:"ゾンビピグリン",value:"PigZombie"},
                {text:"エンダーマン",value:"Enderman"},
                {text:"洞窟グモ",value:"CaveSpider"},
                {text:"シルバーフィッシュ",value:"Silverfish"},
                {text:"ブレイズ",value:"Blaze"},
                {text:"マグマキューブ",value:"LavaSlime"},
                {text:"エンダードラゴン",value:"EnderDragon"},
                {text:"ウィザー",value:"WitherBoss"},
                {text:"コウモリ",value:"Bat"},
                {text:"魔女",value:"Witch"},
                {text:"エンダーマイト",value:"Endermite"},
                {text:"ガーディアン",value:"Guardian"},
                {text:"ブタ",value:"Pig"},
                {text:"ヒツジ",value:"Sheep"},
                {text:"ウシ",value:"Cow"},
                {text:"ニワトリ",value:"Chicken"},
                {text:"イカ",value:"Squid"},
                {text:"オオカミ",value:"Wolf"},
                {text:"ムーシュルーム",value:"MushroomCow"},
                {text:"雪だるま",value:"SnowMan"},
                {text:"ヤマネコ",value:"Ozelot"},
                {text:"アイアンゴーレム",value:"VillagerGolem"},
                {text:"ウマ",value:"EntityHorse"},
                {text:"ウサギ",value:"Rabbit"},
                {text:"村人",value:"Villager"},
                {text:"エンドクリスタル",value:"EnderCrystal"}],
            blockMenu: { acceptReporters: true,
                items: [
                {text:"空気",value:"0,0"},
                {text:"ベッド",value:"26,0"},
                {text:"岩盤",value:"7,0"},
                {text:"本棚",value:"47,0"},
                {text:"レンガブロック",value:"45,0"},
                {text:"サボテン",value:"81,0"},
                {text:"黒のカーペット",value:"171,15"},
                {text:"青のカーペット",value:"171,11"},
                {text:"茶色のカーペット",value:"171,12"},
                {text:"シアンのカーペット",value:"171,9"},
                {text:"灰色のカーペット",value:"171,7"},
                {text:"緑のカーペット",value:"171,13"},
                {text:"水色のカーペット",value:"171,3"},
                {text:"薄い灰色のカーペット",value:"171,8"},
                {text:"黄緑のカーペット",value:"171,5"},
                {text:"マゼンタのカーペット",value:"171,2"},
                {text:"オレンジのカーペット",value:"171,1"},
                {text:"ピンクのカーペット",value:"171,6"},
                {text:"紫のカーペット",value:"171,10"},
                {text:"赤のカーペット",value:"171,14"},
                {text:"白のカーペット",value:"171"},
                {text:"黄色のカーペット",value:"171,4"},
                {text:"チェスト",value:"54,0"},
                {text:"粘土",value:"82,0"},
                {text:"石炭ブロック",value:"173,0"},
                {text:"石炭鉱石",value:"16,0"},
                {text:"丸石",value:"4,0"},
                {text:"クモの巣",value:"30,0"},
                {text:"作業台",value:"58,0"},
                {text:"ダイヤモンドブロック",value:"57,0"},
                {text:"ダイヤモンド鉱石",value:"56,0"},
                {text:"土",value:"3,0"},
                {text:"鉄のドア",value:"71,0"},
                {text:"木のドア",value:"64,0"},
                {text:"大きい草（上）",value:"175,2"},
                {text:"耕地",value:"60,0"},
                {text:"フェンスゲート",value:"107,0"},
                {text:"フェンス",value:"85,0"},
                {text:"火",value:"51,0"},
                {text:"シアンの花",value:"38,0"},
                {text:"黄色の花",value:"37,0"},
                {text:"稼働中のかまど",value:"62,0"},
                {text:"かまど",value:"61,0"},
                {text:"ガラス板",value:"102,0"},
                {text:"ガラス",value:"20,0"},
                {text:"グロウストーン",value:"89,0"},
                {text:"金ブロック",value:"41,0"},
                {text:"金鉱石",value:"14,0"},
                {text:"背の高い草",value:"31,0"},
                {text:"草ブロック",value:"2,0"},
                {text:"砂利",value:"13,0"},
                {text:"黒の硬化粘土",value:"159,15"},
                {text:"青の硬化粘土",value:"159,11"},
                {text:"茶色の硬化粘土",value:"159,12"},
                {text:"シアンの硬化粘土",value:"159,9"},
                {text:"灰色の硬化粘土",value:"159,7"},
                {text:"緑の硬化粘土",value:"159,13"},
                {text:"水色の硬化粘土",value:"159,3"},
                {text:"薄い灰色の硬化粘土",value:"159,8"},
                {text:"黄緑の硬化粘土",value:"159,5"},
                {text:"マゼンタの硬化粘土",value:"159,2"},
                {text:"オレンジの硬化粘土",value:"159,1"},
                {text:"ピンクの硬化粘土",value:"159,6"},
                {text:"紫の硬化粘土",value:"159,10"},
                {text:"赤の硬化粘土",value:"159,14"},
                {text:"白の硬化粘土",value:"159,0"},
                {text:"黄色の硬化粘土",value:"159,4"},
                {text:"氷",value:"79,0"},
                {text:"鉄ブロック",value:"42,0"},
                {text:"鉄鉱石",value:"15,0"},
                {text:"はしご",value:"65,0"},
                {text:"ラピスラズリブロック",value:"22,0"},
                {text:"ラピスラズリ鉱石",value:"21,0"},
                {text:"大きいシダ",value:"175,3"},
                {text:"流れる溶岩",value:"10,0"},
                {text:"溶岩",value:"11,0"},
                {text:"白樺の葉",value:"18,6"},
                {text:"ジャングルの葉",value:"18,7"},
                {text:"オークの葉",value:"18,4"},
                {text:"トウヒの葉",value:"18,5"},
                {text:"葉",value:"18,0"},
                {text:"ライラック",value:"175,1"},
                {text:"スイカ",value:"103,0"},
                {text:"苔石",value:"48,0"},
                {text:"茶色のキノコ",value:"39,0"},
                {text:"赤いキノコ",value:"40,0"},
                {text:"黒曜石",value:"49,0"},
                {text:"ボタン",value:"175,5"},
                {text:"石英ブロック",value:"155,0"},
                {text:"レッドストーンブロック",value:"152,0"},
                {text:"点灯中のレッドストーンランプ",value:"124,0"},
                {text:"レッドストーンランプ",value:"123,0"},
                {text:"レッドストーン鉱石",value:"73,0"},
                {text:"バラの茂み",value:"175,4"},
                {text:"砂",value:"12,0"},
                {text:"砂岩",value:"24,0"},
                {text:"苗木",value:"6,0"},
                {text:"シーランタン",value:"169,0"},
                {text:"雪ブロック",value:"80,0"},
                {text:"雪",value:"78,0"},
                {text:"黒の色付きガラス",value:"95,15"},
                {text:"青の色付きガラス",value:"95,11"},
                {text:"茶色の色付きガラス",value:"95,12"},
                {text:"シアンの色付きガラス",value:"95,9"},
                {text:"灰色の色付きガラス",value:"95,7"},
                {text:"緑の色付きガラス",value:"95,13"},
                {text:"水色の色付きガラス",value:"95,3"},
                {text:"薄い灰色の色付きガラス",value:"95,8"},
                {text:"黄緑の色付きガラス",value:"95,5"},
                {text:"マゼンタの色付きガラス",value:"95,2"},
                {text:"オレンジの色付きガラス",value:"95,1"},
                {text:"ピンクの色付きガラス",value:"95,6"},
                {text:"紫の色付きガラス",value:"95,10"},
                {text:"赤の色付きガラス",value:"95,14"},
                {text:"白の色付きガラス",value:"95,0"},
                {text:"黄色の色付きガラス",value:"95,4"},
                {text:"丸石の階段",value:"67,0"},
                {text:"木の階段",value:"53,0"},
                {text:"石レンガ",value:"98,0"},
                {text:"石のボタン",value:"77,0"},
                {text:"石のダブルハーフブロック",value:"43,0"},
                {text:"石のハーフブロック",value:"44,0"},
                {text:"石",value:"1,0"},
                {text:"サトウキビ",value:"83,0"},
                {text:"ヒマワリ",value:"175,0"},
                {text:"TNT",value:"46,0"},
                {text:"松明",value:"50,0"},
                {text:"流れる水",value:"8,0"},
                {text:"水",value:"9,0"},
                {text:"木のボタン",value:"143,0"},
                {text:"木材",value:"5,0"},
                {text:"原木",value:"17,0"},
                {text:"黒の羊毛",value:"35,15"},
                {text:"青の羊毛",value:"35,11"},
                {text:"茶色の羊毛",value:"35,12"},
                {text:"シアンの羊毛",value:"35,9"},
                {text:"灰色の羊毛",value:"35,7"},
                {text:"緑の羊毛",value:"35,13"},
                {text:"水色の羊毛",value:"35,3"},
                {text:"薄い灰色の羊毛",value:"35,8"},
                {text:"黄緑の羊毛",value:"35,5"},
                {text:"マゼンタの羊毛",value:"35,2"},
                {text:"オレンジの羊毛",value:"35,1"},
                {text:"ピンクの羊毛",value:"35,6"},
                {text:"紫の羊毛",value:"35,10"},
                {text:"赤の羊毛",value:"35,14"},
                {text:"白の羊毛",value:"35,0"},
                {text:"黄色の羊毛",value:"35,4"}
            ]            
            }
            }
        };
    };
    
    parseXYZ(x,y,z) {
        var coords = [];
        if (typeof(x)=="string" && x.indexOf(",") >= 0) {
            return x.split(",").map(parseFloat);
        }
        else {
            return [x,y,z];
        }
    }

    blockByName({name}){
        return name;
    }
    
    sendAndReceive(msg) {
        var rjm = this;
        return new Promise(function(resolve, reject) {            
            rjm.socket.onmessage = function(event) {
                resolve(event.data.trim());
            };
            rjm.socket.onerror = function(err) {
                reject(err);
            };
            rjm.socket.send(msg);
        });
    };
    
    resume() {
        if (this.savedBlocks != null) {
            for (var [key, value] of this.savedBlocks)
                this.socket.send("world.setBlock("+key+","+value+")");
            this.savedBlocks = null;
        }
    };
    
    suspend() {
        if (this.savedBlocks == null) {
            this.savedBlocks = new Map();
        }
    }
    
    drawBlock(x,y,z,b) {
        if (this.savedBlocks != null) {
            this.savedBlocks.set(""+x+","+y+","+z, b);
        }
        else {
            this.socket.send("world.setBlock("+x+","+y+","+z+","+b+")");
        }
    };

    drawLine(x1,y1,z1,x2,y2,z2) {
        var l = this.getLine(x1,y1,z1,x2,y2,z2);
        
        for (var i=0; i<l.length ; i++) {
            this.drawBlock(l[i][0],l[i][1],l[i][2],this.turtle.block);
        }
    };
    
    turnTurtle({dir,n}) {
        if (dir=="right" || dir=="yaw") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));    
        }
        else if (dir=="pitch") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.pitchMatrix(n));    
        }
        else { // if (dir=="roll") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.rollMatrix(n));    
        }
    };
    
    leftTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(-n));    
    }
    
    rightTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));
    }
    
    resetTurtleAngle({n}) {
        this.turtle.matrix = this.turtle.yawMatrix(n);
    };
    
    pen({state}) {
        this.turtle.penDown = state;
    }
    
    turtleBlock({b}) {
        this.turtle.block = b;
    }
    
    turtleBlockEasy({b}) {
        this.turtle.block = b;
    }
    
    setTurtlePosition({x,y,z}) {
        this.turtle.pos = this.parseXYZ(x,y,z);
    }
    
    turtleThickness({n}) {
        if (n==0) {
            this.turtle.nib = [];
        }
        else if (n==1) {
            this.turtle.nib = [[0,0,0]];
        }
        else if (n==2) {
            this.turtle.nib = [];
            for (var x=0; x<=1; x++) 
                for (var y=0; y<=1; y++) 
                    for (var z=0; z<=1; z++) 
                        this.turtle.nib.push([x,y,z]);
        }
        else {
            var r2 = n*n/4;
            var d = Math.ceil(n/2);
            this.turtle.nib = [];
            for (var x=-d; x<=d; x++) 
                for (var y=-d; y<=d; y++) 
                    for (var z=-d; z<=d; z++) 
                        if (x*x+y*y+z*z <= r2)
                            this.turtle.nib.push([x,y,z]);
        }
    }
    
    saveTurtle() {
        var t = this.turtle.clone();
        this.turtleHistory.push(t);
    }
    
    restoreTurtle() {
        if (this.turtleHistory.length > 0) {
            this.turtle = this.turtleHistory.pop();
        }
    }

    drawPoint(x0,y0,z0) {
        var l = this.turtle.nib.length;
        if (l == 0) {
            return;
        }
        else if (l == 1) {
            this.drawBlock(x0,y0,z0,this.turtle.block)
            return;
        }

        for (var i = 0 ; i < l ; i++) {
            var p = this.turtle.nib[i];
            var x = p[0] + x0;
            var y = p[1] + y0;
            var z = p[2] + z0;
            this.drawBlock(x,y,z,this.turtle.block)
        }
    };

    moveTurtle({dir,n}) {
        n *= dir;
        var newX = this.turtle.pos[0] + this.turtle.matrix[0][2] * n;
        var newY = this.turtle.pos[1] + this.turtle.matrix[1][2] * n;
        var newZ = this.turtle.pos[2] + this.turtle.matrix[2][2] * n;
        if (this.turtle.penDown != 0)
            this.drawLine(Math.round(this.turtle.pos[0]),Math.round(this.turtle.pos[1]),Math.round(this.turtle.pos[2]),Math.round(newX),Math.round(newY),Math.round(newZ));
        this.turtle.pos = [newX,newY,newZ];
    }; 
    
    getPosition() {
        return this.sendAndReceive("player.getPos()")
            .then(pos => {
                var p = pos.split(",");
                return [parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])];
            });
    };

    spawnEntity({entity,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z);
        return this.sendAndReceive("world.spawnEntity("+entity+","+x+","+y+","+z+")"); // TODO: do something with entity ID?
    };

    movePlayer({dx,dy,dz}) {
        var [x,y,z] = this.parseXYZ(dx,dy,dz);
        return this.getPosition().then(pos => this.setPlayerPos({x:pos[0]+x,y:pos[1]+y,z:pos[2]+z}));
    };

    movePlayerTop() {
        return this.getPosition().then(pos => 
            this.sendAndReceive("world.getHeight("+Math.floor(pos[0])+","+Math.floor(pos[2])+")").then(
                height => this.setPlayerPos({x:pos[0],y:height,z:pos[2]})));
    };

    getRotation() {
        return this.sendAndReceive("player.getRotation()")
            .then(r => {
                return parseFloat(r);
            });
    };
    
    getBlock({x,y,z}) {
        var pos = ""+this.parseXYZ(x,y,z).map(Math.floor);
        if (this.savedBlocks != null) {
            if (this.savedBlocks.has(pos)) {
                var b = this.savedBlocks.get(pos);
                if (b.indexOf(",")<0)
                    return ""+b+",0";
                else
                    return b;
            }
        }
        return this.sendAndReceive("world.getBlockWithData("+pos+")")
            .then(b => {
                return b;
            });
    };

    onBlock({b}) {
        return this.getPosition().then( pos => this.sendAndReceive("world.getBlockWithData("+Math.floor(pos[0])+","+Math.floor(pos[1]-1)+","+Math.floor(pos[2])+")")
                    .then( block => block == b ) );
    }

    haveBlock({b,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
        return this.sendAndReceive("world.getBlockWithData("+x+","+y+","+z+")")
            .then(block => {
                return block == b;
            });
    };
    
    getPlayerVector({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? ""+pos[0]+","+pos[1]+","+pos[2] : ""+Math.floor(pos[0])+","+Math.floor(pos[1])+","+Math.floor(pos[2]));
    };
    
    makeVector({x,y,z}) {
        return ""+x+","+y+","+z
    }
    
    getHit() {
        if (this.hits.length>0) 
            return ""+this.hits.shift().slice(0,3);
        var rjm = this;
        return this.sendAndReceive("events.block.hits()")
            .then(result => {
                if (result.indexOf(",") < 0) 
                    return "";
                
                else {
                    var hits = result.split("|");
                    for(var i=0;i<hits.length;i++)
                        rjm.hits.push(hits[i].split(",").map(parseFloat));
                }
                return ""+this.shift.pop().slice(0,3);
            });
    };

    extractFromVector({vector,coordinate}) {
        var v = vector.split(",");
        if (v.length <= coordinate) {
            return 0.;
        }
        else {
            return parseFloat(v[coordinate]);
        }
    };

    getPlayerX({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[0] : Math.floor(pos[0]));
    };

    getPlayerY({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[1] : Math.floor(pos[1]));
    };

    getPlayerZ({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[2] : Math.floor(pos[2]));
    };

    connect_p({ip}){
        this.ip = ip;
        var rjm = this;
        return new Promise(function(resolve, reject) {
            if (rjm.socket != null)
                rjm.socket.close();
            rjm.clear();
            rjm.socket = new WebSocket("ws://"+ip+":14711");
            rjm.socket.onopen = function() {                
                resolve();
            };
            rjm.socket.onerror = function(err) {
                reject(err);
            };
        }).then(result => rjm.getPosition().then( result => {
            rjm.turtle.pos = result;
        })).then (result => rjm.getRotation().then( result => {
            rjm.playerRot = result;
            rjm.turtle.matrix = rjm.turtle.yawMatrix(Math.floor(0.5+result/90)*90);
        }));
    };
    
    chat({msg}){
        this.socket.send("chat.post("+msg+")");
    };
    
    getLine(x1,y1,z1,x2,y2,z2) {
        var line = [];
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        z1 = Math.floor(z1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        z2 = Math.floor(z2);
        var point = [x1,y1,z1];
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = z2 - z1;
        var x_inc = dx < 0 ? -1 : 1;
        var l = Math.abs(dx);
        var y_inc = dy < 0 ? -1 : 1;
        var m = Math.abs(dy);
        var z_inc = dz < 0 ? -1 : 1;
        var n = Math.abs(dz);
        var dx2 = l * 2;
        var dy2 = m * 2;
        var dz2 = n * 2;
        
        var nib = this.turtle.nib;
        
        var draw = function(x,y,z) {
            for (var i=0; i<nib.length; i++) {
                var nx = x + nib[i][0];
                var ny = y + nib[i][1];
                var nz = z + nib[i][2];
                var j;
                for (j=0; j<line.length; j++) {
                    if (line[j][0] == nx && line[j][1] == ny && line[j][2] == nz)
                        break;
                }
                if (j<line.length)
                    continue;
                line.push([nx,ny,nz]);
            }
        };

        if (l >= m && l >= n) {
            var err_1 = dy2 - l;
            var err_2 = dz2 - l;
            for (var i=0; i<l; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dx2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dx2;
                }
                err_1 += dy2;
                err_2 += dz2;
                point[0] += x_inc;
            }
        }
        else if (m >= l && m >= n) {
            err_1 = dx2 - m;
            err_2 = dz2 - m;
            for (var i=0; i<m; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[0] += x_inc;
                    err_1 -= dy2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dy2;
                }
                err_1 += dx2;
                err_2 += dz2;
                point[1] += y_inc;
            }
        }
        else {
            err_1 = dy2 - n;
            err_2 = dx2 - n;
            for (var i=0; i < n; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dz2;
                }
                if (err_2 > 0) {
                    point[0] += x_inc;
                    err_2 -= dz2;
                }
                err_1 += dy2;
                err_2 += dx2;
                point[2] += z_inc;
            }
        }
        draw(point[0],point[1],point[2]);
        if (point[0] != x2 || point[1] != y2 || point[2] != z2) {
            draw(x2,y2,z2);
        }
        return line;
    };
    
    setBlock({x,y,z,b}) {
      var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
      this.drawBlock(x,y,z,b);
    };

    setPlayerPos({x,y,z}) {
      var [x,y,z] = this.parseXYZ(x,y,z);
      this.socket.send("player.setPos("+x+","+y+","+z+")");
    };
}

(function() {
    var extensionClass = RaspberryJamMod
    if (typeof window === "undefined" || !window.vm) {
        Scratch.extensions.register(new extensionClass())
    }
    else {
        var extensionInstance = new extensionClass(window.vm.extensionManager.runtime)
        var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
        window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
    }
})()
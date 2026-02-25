"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "otto-vs-extension" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('otto-vs-extension.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from otto-vs-extension!');
    });
    context.subscriptions.push(disposable);
    const clawGameDisposable = vscode.commands.registerCommand('otto-vs-extension.clawGame', () => {
        const panel = vscode.window.createWebviewPanel('clawGame', 'Máquina de Garra', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [context.extensionUri]
        });
        const clawClosedImageUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'Garra.png'));
        const clawOpenImageUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'GarraAbierta.png'));
        panel.webview.html = getClawGameHtml(clawClosedImageUri.toString(), clawOpenImageUri.toString());
    });
    context.subscriptions.push(clawGameDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
function getClawGameHtml(clawClosedImageSrc, clawOpenImageSrc) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Máquina de Garra</title>
      <style>
        body { background: #222; color: #fff; font-family: sans-serif; margin: 0; overflow: hidden; }
        #game-container { position: relative; width: 400px; height: 500px; margin: 40px auto; background: #333; border-radius: 16px; box-shadow: 0 0 16px #000; }
        #claw { position: absolute; top: 0; left: 0; width: 60px; height: auto; transition: left 0.2s linear, top 0.5s linear; z-index: 2; }
        #plushies { position: absolute; bottom: 60px; left: 0; width: 100%; height: 120px; display: flex; justify-content: space-around; align-items: flex-end; z-index: 1; }
        .plushie { width: 50px; height: 50px; background: #ffb347; border-radius: 50%; border: 2px solid #fff; margin-bottom: 10px; box-shadow: 0 2px 8px #0006; transition: transform 0.5s, background 0.5s; }
        .plushie.grabbed { transform: scale(1.2) translateY(-60px); background: #4caf50; }
        #controls { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; gap: 8px; }
        #controls button { padding: 10px 20px; font-size: 16px; background: #444; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
        #start-btn { background: #ff4081; }
        #drop-btn { background: #448aff; }
        #controls button:disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(30%); }
      </style>
    </head>
    <body>
      <div id="game-container">
        <img id="claw" src="${clawClosedImageSrc}" alt="Garra" />
        <div id="plushies">
          <div class="plushie" id="plushie1"></div>
          <div class="plushie" id="plushie2"></div>
          <div class="plushie" id="plushie3"></div>
        </div>
        <div id="controls">
          <button id="start-btn">¡Jugar!</button>
          <button id="drop-btn" disabled>Bajar Garra</button>
        </div>
      </div>
      <script>
        let claw = document.getElementById('claw');
        const clawClosedSrc = '${clawClosedImageSrc}';
        const clawOpenSrc = '${clawOpenImageSrc}';
        let startBtn = document.getElementById('start-btn');
        let dropBtn = document.getElementById('drop-btn');
        let plushies = document.querySelectorAll('.plushie');
        let clawMoving = false;
        let clawDirection = 1;
        let clawLeft = 0;
        let clawInterval;
        let gameState = 'idle'; // idle, moving, dropping, grabbing, releasing
        let grabbedPlushie = null;

        function moveClaw() {
          clawMoving = true;
          gameState = 'moving';
          clawInterval = setInterval(() => {
            clawLeft += clawDirection * 8;
            if (clawLeft > 340) { clawDirection = -1; }
            if (clawLeft < 0) { clawDirection = 1; }
            claw.style.left = clawLeft + 'px';
          }, 40);
        }

        function stopClaw() {
          clearInterval(clawInterval);
          clawMoving = false;
          gameState = 'dropping';
          dropClaw();
          dropBtn.disabled = true;
          startBtn.disabled = false;
        }

        function dropClaw() {
          claw.src = clawOpenSrc;
          claw.style.top = '320px';
          setTimeout(() => {
            grabPlushie();
          }, 700);
        }

        function grabPlushie() {
          let clawCenter = clawLeft + 30;
          let grabbed = null;
          plushies.forEach(p => {
            let rect = p.getBoundingClientRect();
            let plushCenter = rect.left + rect.width / 2 - document.getElementById('game-container').getBoundingClientRect().left;
            if (Math.abs(clawCenter - plushCenter) < 30) {
              grabbed = p;
            }
          });
          if (grabbed) {
            grabbed.classList.add('grabbed');
            grabbedPlushie = grabbed;
            claw.src = clawClosedSrc;
            setTimeout(() => {
              claw.style.top = '0px';
              gameState = 'releasing';
              releasePlushie(grabbed);
            }, 700);
          } else {
            claw.style.top = '0px';
            gameState = 'idle';
            dropBtn.disabled = true;
            startBtn.disabled = false;
            claw.src = clawClosedSrc;
          }
        }

        function releasePlushie(plushie) {
          claw.style.left = '340px';
          setTimeout(() => {
            plushie.classList.remove('grabbed');
            gameState = 'idle';
            dropBtn.disabled = true;
            startBtn.disabled = false;
            clawLeft = 340;
          }, 700);
        }

        startBtn.addEventListener('click', () => {
          if (gameState === 'idle') {
            startBtn.disabled = true;
            dropBtn.disabled = false;
            clawLeft = 0;
            claw.style.left = '0px';
            claw.style.top = '0px';
            moveClaw();
          }
        });

        dropBtn.addEventListener('click', () => {
          if (gameState === 'moving') {
            stopClaw();
          }
        });
      </script>
    </body>
    </html>
  `;
}
//# sourceMappingURL=extension.js.map
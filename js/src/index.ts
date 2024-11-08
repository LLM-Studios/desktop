import { Sandbox as BaseSandbox } from "e2b"

interface DesktopActions {
    screenshot(): Promise<Uint8Array>
    open(fileOrUrl: string): Promise<void>
    installPackage(packageName: string): Promise<void>
    getScreenSize(): Promise<{ width: number, height: number }>
}
  
interface MouseActions {
    leftClick(): Promise<void>
    doubleClick(): Promise<void>
    rightClick(): Promise<void>
    middleClick(): Promise<void>
    scroll(amount: number): Promise<void>
    mouseMove(x: number, y: number): Promise<void>
    getCursorPosition(): Promise<{ x: number, y: number }>
}

interface KeyboardActions {
    write(text: string): Promise<void>
    hotkey(keys: string[]): Promise<void>
}

export class Sandbox extends BaseSandbox {
    public desktop = {
        // Desktop actions
        screenshot: this.screenshot.bind(this),
        open: this.open.bind(this),
        installPackage: this.installPackage.bind(this),
        getScreenSize: this.getScreenSize.bind(this),

        // Mouse actions
        leftClick: this.leftClick.bind(this),
        doubleClick: this.doubleClick.bind(this),
        rightClick: this.rightClick.bind(this),
        middleClick: this.middleClick.bind(this),
        mouseMove: this.mouseMove.bind(this),
        scroll: this.scroll.bind(this),
        getCursorPosition: this.getCursorPosition.bind(this),

        // Keyboard actions
        write: this.write.bind(this),
        hotkey: this.hotkey.bind(this),
    } satisfies DesktopActions & MouseActions & KeyboardActions;

    private async screenshot() {
        const screenshotPath = `/home/user/screenshot-${Date.now()}.png`
    
        await this.commands.run(`scrot --pointer ${screenshotPath}`, { cwd: '/home/user' })
    
        return this.files.read(screenshotPath, { format: 'bytes' })
    }

    private async leftClick() {
        return this.pyautogui(`pyautogui.leftClick()`)
    }

    private async doubleClick() {
        return this.pyautogui(`pyautogui.doubleClick()`)
    }

    private async rightClick() {
        return this.pyautogui(`pyautogui.rightClick()`)
    }

    private async middleClick() {
        return this.pyautogui(`pyautogui.middleClick()`)
    }

    private async scroll(amount: number) {
        return this.pyautogui(`pyautogui.scroll(${amount})`)
    }

    private async mouseMove(x: number, y: number) {
        return this.pyautogui(`pyautogui.moveTo(${x}, ${y})`)
    }

    private async getCursorPosition() {
        return this.pyautogui(`
x, y = pyautogui.position()
with open("/tmp/cursor_position.txt", "w") as f:
    f.write(str(x) + " " + str(y))
    `)
    }

    private async getScreenSize() {
        return this.pyautogui(`
width, height = pyautogui.size()
with open("/tmp/size.txt", "w") as f:
    f.write(str(width) + " " + str(height))
    `)
    }

    private async write(text: string) {
        return this.pyautogui(`pyautogui.write(${text})`)
    }

    private async hotkey(keys: string[]) {
        return this.pyautogui(`pyautogui.hotkey(${keys.map(key => `'${key}'`).join(', ')})`)
    }

    private async open(fileOrUrl: string) {
        return this.commands.run(`xdg-open ${fileOrUrl}`, { background: true })
    }

    private async installPackage(packageName: string) {
        return this.commands.run(`apt-get install -y ${packageName}`)
    }

    private wrapPyautoguiCode(code: string) {
        return `
import pyautogui
import os
import Xlib.display

display = Xlib.display.Display(os.environ["DISPLAY"])
pyautogui._pyautogui_x11._display = display

${code}
exit(0)
`
    }

    private async pyautogui(code: string) {
        const codePath = `/home/user/code-${Date.now()}.py`

        const wrappedCode = this.wrapPyautoguiCode(code)

        await this.files.write(codePath, wrappedCode)

        return this.commands.run(`python ${codePath}`)
    }
}

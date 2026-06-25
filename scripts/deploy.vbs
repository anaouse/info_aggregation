Set WshShell = CreateObject("WScript.Shell")

' 绝对路径（脚本可任意移动）
rootDir    = "D:\projects\info_aggregation"
backendDir = "D:\projects\info_aggregation\info_aggregation_backend"

' ── 1. 构建前端 ──────────────────────────────────
WshShell.CurrentDirectory = rootDir
ret = WshShell.Run("cmd /c npm run build", 1, True)      ' 1=可见, True=等待完成
If ret <> 0 Then
    MsgBox "✗ Frontend build failed!", 16, "Deploy Error"
    WScript.Quit
End If

' ── 2. 构建后端 ──────────────────────────────────
WshShell.CurrentDirectory = backendDir
ret = WshShell.Run("cmd /c go build -o info_aggregation_backend.exe", 1, True)
If ret <> 0 Then
    MsgBox "✗ Backend build failed!", 16, "Deploy Error"
    WScript.Quit
End If

' ── 3. 隐藏启动前端 preview（端口 4000）───────────
WshShell.CurrentDirectory = rootDir
WshShell.Run "cmd /c npx vite preview --port 4000", 0, False   ' 0=隐藏, False=不等待

' ── 4. 隐藏启动后端 ──────────────────────────────
WshShell.CurrentDirectory = backendDir
WshShell.Run backendDir & "\info_aggregation_backend.exe", 0, False

MsgBox "✓ Deploy complete!" & vbCrLf & vbCrLf & _
       "Frontend:  http://localhost:5989" & vbCrLf & _
       "Backend:   http://localhost:1233", 64, "Info Aggregation"

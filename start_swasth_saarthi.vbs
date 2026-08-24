Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 1. Start FastAPI Backend silently in background (window style 0 = completely hidden)
WshShell.Run "cmd /c ""cd /d d:\LetsCode\SwasthSaarthi\backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000""", 0, False

' 2. Start Vite Frontend silently in background (window style 0 = completely hidden)
WshShell.Run "cmd /c ""cd /d d:\LetsCode\SwasthSaarthi\frontend && npm run dev""", 0, False

' 3. Wait 3 seconds for servers to start up
WScript.Sleep 3000

' 4. Launch in Standalone App Window Mode (No Chrome tabs/URL bar, looks like native desktop app)
Dim chromePath, edgePath
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """" & " --app=http://localhost:3000", 1, False
ElseIf fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """" & " --app=http://localhost:3000", 1, False
Else
    WshShell.Run "cmd /c start http://localhost:3000", 0, False
End If

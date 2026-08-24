Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "taskkill /F /IM node.exe /T", 0, False
WshShell.Run "taskkill /F /IM python.exe /T", 0, False

@echo off
rem slimechan3 launcher for Windows.
rem Starts the standalone server with the DEP0169 warning suppressed.
rem (Keep this file ASCII-only: cmd.exe may garble non-ASCII comments.)
cd /d "%~dp0"

rem --disable-warning requires Node v20.11+. Skip it on older Node.
node --disable-warning=DEP0169 -e "" >nul 2>&1
if %errorlevel%==0 (
	set "NODE_OPTIONS=%NODE_OPTIONS% --disable-warning=DEP0169"
)

node server.js

@echo off
echo ===================================================
echo Starting CampusConnect (instaweb) Full-Stack Server
echo ===================================================

echo Starting Backend API Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0server && node index.js"

echo Starting Frontend Vite App (Port 5173)...
start "Frontend Client" cmd /k "cd /d %~dp0client && npm run dev"

echo Done! Both servers are launching.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause

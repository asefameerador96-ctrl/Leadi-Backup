@echo off
title Deploying to GitHub + Azure

echo ================================================
echo  Leaderboard Deploy: GitHub + Azure
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Staging changed files...
git add src/components/Leaderboard.tsx src/lib/csvParser.ts src/types/leaderboard.ts
echo.

echo [3/4] Committing...
git commit -m "feat: stack Week Badge above title; add Territory Code CSV column

- Position 'Week 3 Rankings' badge above 'XForce Leaderboard' (stacked, not side-by-side)
- Add Territory Code as first CSV column to link TSO images from uploaded zip archive
- Update CSVRow interface and CSV template accordingly

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo.

echo [4/4] Pushing to GitHub (main)...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ================================================
    echo  SUCCESS! Code pushed to GitHub.
    echo  GitHub Actions will now auto-deploy to Azure.
    echo.
    echo  Monitor deployment:
    echo  https://github.com/asefameerador96-ctrl/Leadi-Backup/actions
    echo.
    echo  Live site: https://www.leaderboards.online
    echo ================================================
) else (
    echo ================================================
    echo  ERROR: Push failed. Check the output above.
    echo  Make sure you are logged in to GitHub.
    echo  Run: git remote -v  to verify remote URL.
    echo ================================================
)

echo.
pause

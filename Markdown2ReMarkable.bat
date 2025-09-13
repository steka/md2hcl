@echo off
cls
pushd
setlocal

if "%~1"=="" echo Usage: Markdown2ReMarkable.bat {markdownfile} & goto error

call :CreateTempDir %~n0 TEMPDIR
set "HCLFILE=%TEMPDIR%\%~n1.hcl"
set "RMDOCFILE=%TEMPDIR%\%~n1.rmdoc"

@echo on
node md2hcl.js "%~1" "%HCLFILE%"
@echo off
if errorlevel 1 goto error
echo.

rem call :AskForInput "Do you what to edit the hcl-file before converting and sending it" "y n" "n" ANSWER
rem if "%ANSWER%"=="y" notepad "%HCLFILE%"

@echo on
java -jar drawj2d.jar --type rmdoc --outfile "%RMDOCFILE%" "%HCLFILE%"
@echo off
if errorlevel 1 goto error

@echo on
curl http://10.11.99.1/upload --header "Origin: http://10.11.99.1" --header "Accept: */*" --header "Referer: http://10.11.99.1/" --header "Connection: keep-alive" --form "file=@%RMDOCFILE%" | findstr "Upload successful"
@echo off
if errorlevel 1 goto error

goto done

:CreateTempDir
REM %1 = prefix for the temporary directory name
REM %2 = name of the output variable to receive the full temporary directory name
setlocal enableextensions enabledelayedexpansion
:generate_new_dirname
set "dirname=%TEMP%\%~1_%RANDOM%%RANDOM%"
mkdir "!dirname!"
if errorlevel 1 goto generate_new_dirname
endlocal & set "%~2=%dirname%"
exit /b 0

:AskForInput
rem %1 = prompt
rem %2 = space-separated list of valid answers (case-insensitive)
rem %3 = default answer
rem %4 = variable name to store input
setlocal enableextensions enabledelayedexpansion
set "validOptions=%~2"
set "defaultAnswer=%~3"
:InputLoop
set "input=%defaultAnswer%"
set /p "input=%~1 [%validOptions%] (default: %defaultAnswer%): "
set "valid=0"
for %%A in (%validOptions%) do (
    if /I "%%A"=="!input!" set "valid=1"
)
if "!valid!"=="0" (
    echo Invalid input. Please enter one of: %validOptions%
    goto InputLoop
)
endlocal & set "%~4=%input%"
exit /b

:error
echo.
echo Errors detected!
pause

:done
rmdir /S/Q "%TEMPDIR%"
popd

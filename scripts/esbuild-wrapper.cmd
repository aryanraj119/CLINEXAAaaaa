@echo off
setlocal
set "ROOT=%~dp0..\\"
if /I "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
  set "ARCH_DIR=@esbuild\win32-x64"
) else if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" (
  set "ARCH_DIR=@esbuild\win32-arm64"
) else if /I "%PROCESSOR_ARCHITECTURE%"=="IA64" (
  set "ARCH_DIR=@esbuild\win32-x64"
) else if /I "%PROCESSOR_ARCHITECTURE%"=="x86" (
  set "ARCH_DIR=@esbuild\win32-ia32"
) else (
  set "ARCH_DIR=@esbuild\win32-x64"
)
set "BIN=%ROOT%node_modules\%ARCH_DIR%\esbuild.exe"
if not exist "%BIN%" (
  echo esbuild executable not found at "%BIN%" 1>&2
  exit /b 1
)
"%BIN%" %*

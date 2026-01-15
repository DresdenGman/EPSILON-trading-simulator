# Build Instructions for Stock Trading Simulator

This document provides instructions for building the Stock Trading Simulator as standalone executables for Windows, macOS, and Linux.

## Prerequisites

1. **Python 3.12** (recommended) or Python 3.10+
2. **All dependencies installed**:
   ```bash
   pip install -r requirements.txt
   pip install pyinstaller
   ```

3. **Platform-specific requirements**:
   - **Windows**: No additional requirements
   - **macOS**: Xcode Command Line Tools (for code signing, optional)
   - **Linux**: Standard build tools (usually pre-installed)

## Quick Build

### Windows

```bash
# Option 1: Use the batch script
build_windows.bat

# Option 2: Manual build
pyinstaller stock_simulator.spec --clean
```

The executable will be in `dist/StockTradingSimulator.exe`

### macOS

```bash
# Make script executable
chmod +x build_macos.sh

# Run build script
./build_macos.sh

# Or manual build
pyinstaller stock_simulator.spec --clean
```

The application will be in `dist/StockTradingSimulator.app`

**Note for macOS**: You may need to sign the app for distribution:
```bash
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" dist/StockTradingSimulator.app
```

### Linux

```bash
# Make script executable
chmod +x build_linux.sh

# Run build script
./build_linux.sh

# Or manual build
pyinstaller stock_simulator.spec --clean
```

The executable will be in `dist/StockTradingSimulator`

Make it executable:
```bash
chmod +x dist/StockTradingSimulator
```

## Customizing the Build

### Adding an Icon

1. Prepare icon files:
   - Windows: `icon.ico` (256x256 recommended)
   - macOS: `icon.icns` (512x512 recommended)
   - Linux: `icon.png` (256x256 recommended)

2. Edit `stock_simulator.spec`:
   - Find the line: `icon=None,`
   - Replace with: `icon='icon.ico',` (or appropriate format for your platform)

### Reducing File Size

The spec file already excludes test modules. To further reduce size:

1. **Remove optional dependencies** (if not needed):
   - Comment out AI libraries in `excludes` list
   - Remove `mplfinance` if not using candlestick charts

2. **Use UPX compression** (already enabled):
   - Download UPX from https://upx.github.io/
   - PyInstaller will automatically use it if found in PATH

3. **Use --onedir instead of --onefile**:
   - Edit spec file: Change `EXE` to create a directory instead
   - Smaller size, but requires installation

### Handling akshare Issues

If akshare causes problems during build:

1. **Option 1**: Build without akshare (mock data mode only)
   - The app will automatically use mock data if akshare is unavailable

2. **Option 2**: Use `--collect-all akshare`:
   - Add to spec file: `collect_all('akshare')` in hiddenimports

3. **Option 3**: Build with akshare but handle missing dependencies gracefully
   - The app already handles akshare unavailability

## Troubleshooting

### "ModuleNotFoundError" after building

1. Check if the module is in `hiddenimports` list
2. Add it manually to the spec file
3. Rebuild: `pyinstaller stock_simulator.spec --clean`

### Large file size

- Normal size: 100-200 MB (includes Python runtime + all dependencies)
- To reduce: Use `--onedir` instead of `--onefile`
- Exclude unnecessary modules in `excludes` list

### Windows: "Windows Defender" warning

- This is normal for unsigned executables
- Users need to click "More info" -> "Run anyway"
- To fix: Get a code signing certificate (expensive)

### macOS: "App is damaged" error

- This is Gatekeeper blocking unsigned apps
- Solution 1: Right-click -> Open (first time only)
- Solution 2: Sign the app (requires Apple Developer account)
- Solution 3: Notarize the app (for distribution)

### Linux: "Permission denied"

```bash
chmod +x dist/StockTradingSimulator
```

## Testing the Build

1. **Test on a clean machine** (without Python installed):
   - Copy the executable to a test machine
   - Run it and test all features
   - Check that data files are saved correctly

2. **Test data persistence**:
   - Make some trades
   - Close and reopen the app
   - Verify data is preserved

3. **Test all features**:
   - Stock selection
   - Trading operations
   - Order placement
   - Data export
   - AI analysis (if enabled)

## Distribution

### For GitHub Releases

1. Build for all platforms
2. Create a release on GitHub
3. Upload:
   - Windows: `StockTradingSimulator.exe` (or zip it)
   - macOS: `StockTradingSimulator.app` (zip it: `zip -r StockTradingSimulator-macOS.zip StockTradingSimulator.app`)
   - Linux: `StockTradingSimulator` (or create a .tar.gz)

### File Naming Convention

- Windows: `StockTradingSimulator-v1.0.0-Windows.exe`
- macOS: `StockTradingSimulator-v1.0.0-macOS.zip`
- Linux: `StockTradingSimulator-v1.0.0-Linux.tar.gz`

## Advanced: Creating Installers

### Windows: Inno Setup

1. Install Inno Setup
2. Create installer script
3. Include the .exe and create shortcuts

### macOS: DMG Creation

```bash
# Create DMG
hdiutil create -volname "Stock Trading Simulator" -srcfolder dist/StockTradingSimulator.app -ov -format UDZO StockTradingSimulator.dmg
```

### Linux: AppImage

Use `appimagetool` to create a portable AppImage file.

## Next Steps

After building, proceed to:
1. Test the executables thoroughly
2. Create GitHub Releases
3. Build the website with download links




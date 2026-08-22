import os
import sys
import subprocess
import shutil

def main():
    print("=" * 60)
    print("   SWASTH SAARTHI (AYUR SAARTHI) — AUTOMATED TEAM SETUP")
    print("=" * 60)
    
    # 1. Check Python Version
    python_ver = sys.version_info
    print(f"[+] Python Version: {python_ver.major}.{python_ver.minor}.{python_ver.micro}")
    if python_ver.major < 3 or (python_ver.major == 3 and python_ver.minor < 9):
        print("[-] Error: Python 3.9 or higher is required.")
        sys.exit(1)

    # 2. Check Working Directory
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    
    print(f"[+] Root Path: {root_dir}")

    # 3. Setup .env file
    env_example = os.path.join(backend_dir, ".env.example")
    env_file = os.path.join(backend_dir, ".env")
    if os.path.exists(env_example) and not os.path.exists(env_file):
        shutil.copy(env_example, env_file)
        print("[+] Created backend/.env from template.")
    else:
        print("[+] backend/.env file is present.")

    # 4. Install Backend Requirements
    print("\n[+] Installing Backend Python Packages...")
    req_file = os.path.join(backend_dir, "requirements.txt")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
        print("[+] Backend dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"[-] Backend installation failed: {e}")
        sys.exit(1)

    # 5. Check Node.js & npm for Frontend
    print("\n[+] Checking Node.js & npm...")
    try:
        node_version = subprocess.check_output(["node", "-v"], text=True).strip()
        npm_version = subprocess.check_output(["npm", "-v"], text=True).strip()
        print(f"[+] Node.js: {node_version} | npm: {npm_version}")
        
        if os.path.exists(os.path.join(frontend_dir, "package.json")):
            print("[+] Installing Frontend npm Packages...")
            subprocess.check_call(["npm", "install"], cwd=frontend_dir, shell=True)
            print("[+] Frontend dependencies installed successfully!")
    except FileNotFoundError:
        print("[!] Warning: Node.js / npm not found in system PATH. Install Node.js v18+ for frontend.")

    print("\n" + "=" * 60)
    print("   SETUP COMPLETE! YOU ARE READY TO DEVELOP SWASTH SAARTHI.")
    print("   To start backend: cd backend && python main.py")
    print("   To start frontend: cd frontend && npm run dev")
    print("=" * 60)

if __name__ == "__main__":
    main()

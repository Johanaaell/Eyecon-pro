import os
import subprocess
import sys
import urllib.request
import tarfile
import shutil

PORT = int(os.environ.get("PORT", 7860))

def install_node():
    """Downloads and extracts a portable Node.js binary if not already present."""
    node_dir = os.path.join(os.getcwd(), ".node")
    node_bin = os.path.join(node_dir, "bin", "node")
    
    # Check if node is already installed in the system PATH
    system_node = shutil.which("node")
    if system_node:
        print(f"Found system Node.js: {system_node}")
        return system_node

    if os.path.exists(node_bin):
        print(f"Found local Node.js: {node_bin}")
        # Add to PATH
        os.environ["PATH"] = os.path.join(node_dir, "bin") + os.pathsep + os.environ.get("PATH", "")
        return node_bin

    print("System Node.js not found. Downloading standalone Node.js v20.11.0 (Linux x64)...")
    url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz"
    archive_path = os.path.join(os.getcwd(), "node.tar.xz")
    
    try:
        # Download Node.js
        urllib.request.urlretrieve(url, archive_path)
        print("Download complete. Extracting...")
        
        # Extract the archive
        with tarfile.open(archive_path, "r:xz") as tar:
            tar.extractall(path=os.getcwd())
            
        # Rename to .node
        extracted_dir = os.path.join(os.getcwd(), "node-v20.11.0-linux-x64")
        if os.path.exists(node_dir):
            shutil.rmtree(node_dir)
        os.rename(extracted_dir, node_dir)
        
        # Clean up archive
        if os.path.exists(archive_path):
            os.remove(archive_path)
            
        # Add to PATH
        os.environ["PATH"] = os.path.join(node_dir, "bin") + os.pathsep + os.environ.get("PATH", "")
        print(f"Standalone Node.js installed successfully at: {node_bin}")
        return node_bin
    except Exception as e:
        print(f"Error downloading or installing Node.js: {e}", file=sys.stderr)
        # Fallback to system package manager if available
        return None

def start_app():
    # 1. Install Node.js if necessary
    node_bin = install_node()
    
    # 2. Set production env variables
    os.environ["PORT"] = str(PORT)
    os.environ["NODE_ENV"] = "production"
    
    # 3. Install packages and build
    print("Installing npm dependencies...")
    subprocess.run(["npm", "install"], check=True)
    
    print("Building application...")
    subprocess.run(["npm", "run", "build"], check=True)
    
    # 4. Start Node.js Express backend
    print(f"Launching Express server on port {PORT}...")
    # Using execvp so that Node replaces the Python process and receives OS signals
    if node_bin:
        node_executable = node_bin
    else:
        node_executable = "node"
        
    os.execvp(node_executable, [node_executable, "dist/server.cjs"])

if __name__ == "__main__":
    start_app()

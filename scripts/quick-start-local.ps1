
# Get the current directory
$parent_dir = Get-Location
$apps_dir = "$parent_dir/apps"

# Get all directories in the parent directory
$directories = Get-ChildItem -Path $apps_dir -Directory

# Loop over all directories
foreach ($dir in $directories) {
    # Get the folder name
    $folder_name = $dir.Name

    if ($folder_name -eq "utility" -or $folder_name -eq "task") {
        continue
    }

    # Open a new PowerShell window and run the command with a unique identifier in the process title
    Start-Process powershell -ArgumentList "-NoExit", "-Command yarn start $folder_name"
}

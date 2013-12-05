$nugetContent = "content"

$mvcJs = $nugetContent + "/Scripts"
$srcJs = $src + "..\dist\*"

if(Test-Path $nugetContent) { Remove-Item -Recurse -Force $nugetContent }
mkdir $nugetContent
mkdir $mvcJs

copy-item -Recurse -Force $srcJs $mvcJs

.\nuget pack Package.nuspec
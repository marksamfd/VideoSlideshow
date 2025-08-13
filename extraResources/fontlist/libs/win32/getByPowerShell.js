/**
 * getByPowerShell
 * @author: oldj
 * @homepage: https://oldj.net
 */

const exec = require("child_process").exec;

const parse = (str) => {
  return str
    .split("\n")
    .map((ln) => ln.trim())
    .filter((f) => !!f);
};
/*
@see https://superuser.com/questions/760627/how-to-list-installed-font-families

  chcp 65001 | Out-Null
  Add-Type -AssemblyName PresentationCore
  $families = [Windows.Media.Fonts]::SystemFontFamilies
  foreach ($family in $families) {
    $name = ''
    if (!$family.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'), [ref]$name)) {
      $name = $family.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]
    }
    echo $name
  }
*/
module.exports = () =>
  new Promise((resolve, reject) => {
    let cmd = `chcp 65001|powershell -command "chcp 65001|Out-Null;Add-Type -AssemblyName PresentationCore;$families=[Windows.Media.Fonts]::SystemFontFamilies;foreach($family in $families){$name='';if(!$family.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'),[ref]$name)){$name=$family.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]}echo $name}"`;
    /*
    cmd = `chcp 65001 | powershell -command "chcp 65001 | Out-Null;
Add-Type -AssemblyName PresentationCore;
$fams = [Windows.Media.Fonts]::SystemFontFamilies;
$result = @();
foreach ($fam in $fams) {
    # Pick preferred name
    $name = '';
    if (-not $fam.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'), [ref]$name)) {
        $name = $fam.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]
    }

    # Gather languages this font supports
    $langs = $fam.FamilyNames.Keys | ForEach-Object { $_.IetfLanguageTag }

    # Gather all typefaces
    $faces = @();
    foreach ($tf in $fam.GetTypefaces()) {
        $face = '';
        if (-not $tf.FaceNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'), [ref]$face)) {
            $face = $tf.FaceNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]
        }
        if ([string]::IsNullOrWhiteSpace($face)) {
            $face = "$($tf.Weight) $($tf.Style)"
        }
        $faces += $face
    }

    $result += [PSCustomObject]@{
        name = $name
        languages = $langs
        faces = $faces
    }
}
$result | ConvertTo-Json -Depth 4 -Encoding UTF8
"`; */
    // const scriptPath = path.join(__dirname, "GetSystemFonts.ps1");

    // execFile("powershell", ["-ExecutionPolicy", "Bypass", "-File", scriptPath], { encoding: "utf8" },(err, stdout) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(parse(stdout));
    });
  });

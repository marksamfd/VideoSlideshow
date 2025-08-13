# GetSystemFonts.ps1
# Lists all system fonts with their localized names, available languages, and styles in JSON

# Ensure UTF-8 output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName PresentationCore

$fams = [Windows.Media.Fonts]::SystemFontFamilies
$result = @()

$languageSamples = @{
    "en" = 0x0041 # Latin capital A
    "ar" = 0x0627 # Arabic Alef
}
foreach ($fam in $fams) {
    # Preferred family name (try zh-CN first, fallback to en-US)
    $name = ''
    if (-not $fam.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'), [ref]$name)) {
        $name = $fam.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]
    }

    
    # Supported language codes
    $langs = @()

    foreach ($typeface in $fam.GetTypefaces()) {
        try {
            $glyph = New-Object Windows.Media.GlyphTypeface $typeface.FontUri
            foreach ($lang in $languageSamples.Keys) {
                if ($glyph.CharacterToGlyphMap.ContainsKey($languageSamples[$lang])) {
                    $langs += $lang
                }
            }
        }
        catch {}
    }

    $langs = $langs | Sort-Object -Unique


    # All typefaces (weights/styles)
    $faces = @()
    foreach ($tf in $fam.GetTypefaces()) {
        $face = ''
        if (-not $tf.FaceNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'), [ref]$face)) {
            $face = $tf.FaceNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]
        }
        if ([string]::IsNullOrWhiteSpace($face)) {
            $face = "$($tf.Weight) $($tf.Style)"
        }
        $faces += $face
    }

    $result += [PSCustomObject]@{
        name  = $name
        # faces = $faces
    }
}

$result | ConvertTo-Json -Depth 4

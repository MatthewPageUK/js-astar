<?php

/**
 * Generate a Javascript map file from a PNG file.
 *
 * Usage: php generate-map.php <image>
 *
 * The PNG file must be located in the gfx/ directory.
 * The output file will be written to the current directory.
 *
 * @todo - starting pixel #ff0000
 * @todo - player starting pixel #00ff00
 *
 */
if (! isset($argv[1])) {
    die('Please specify an image.');
}

$map = $argv[1];
$imagePath = 'gfx/' . $map . '.png';
$jsPath = $map . '.js';

// Load the PNG image
$image = imagecreatefrompng($imagePath);

if ($image === false) {
    die('Failed to load the image. ' . $imagePath);
}

// Get the dimensions of the image.
$width = imagesx($image);
$height = imagesy($image);

$imageArray = [];
for ($y = 0; $y < $height; $y++) {
    for ($x = 0; $x < $width; $x++) {
        $color = imagecolorat($image, $x, $y);

        $isWhite = ($color === 0xFFFFFF) ? 1 : 0;

        $imageArray[$y][$x] = $isWhite;
    }
}

// Generate JavaScript code to define the array.
$jsCode = '
    var mapWidth = ' . $width . ';
    var mapHeight = ' . $height . ';
    var imageArray = ' . json_encode($imageArray) . ';
';

// Write the JavaScript code to the file.
file_put_contents($jsPath, $jsCode);

echo 'A map map has been written to ' . $jsPath;

?>

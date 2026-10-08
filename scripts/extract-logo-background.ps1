param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public static class LogoCutout {
  public static void Save(string inputPath, string outputPath) {
    using (var source = new Bitmap(inputPath)) {
      int width = source.Width, height = source.Height, count = width * height;
      var background = new bool[count];
      var queue = new int[count];
      int head = 0, tail = 0;
      Action<int> visit = index => {
        if (index < 0 || index >= count || background[index]) return;
        var color = source.GetPixel(index % width, index / width);
        // The source canvas and its cool gray shadow are neutral; the ivory
        // house edge has a warm red-blue difference. Only flood from outside.
        if (color.R - color.B >= 9) return;
        background[index] = true;
        queue[tail++] = index;
      };
      for (int x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
      for (int y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
      while (head < tail) {
        int index = queue[head++], x = index % width;
        if (x > 0) visit(index - 1);
        if (x + 1 < width) visit(index + 1);
        if (index >= width) visit(index - width);
        if (index + width < count) visit(index + width);
      }

      var output = new Bitmap(width, height, PixelFormat.Format32bppArgb);
      int left = width, top = height, right = -1, bottom = -1;
      for (int y = 0; y < height; y++) for (int x = 0; x < width; x++) {
        int index = y * width + x;
        if (background[index]) continue;
        var color = source.GetPixel(x, y);
        output.SetPixel(x, y, Color.FromArgb(255, color.R, color.G, color.B));
        left = Math.Min(left, x); top = Math.Min(top, y);
        right = Math.Max(right, x); bottom = Math.Max(bottom, y);
      }
      if (right < left) throw new Exception("No foreground found");
      var crop = Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
      using (var trimmed = output.Clone(crop, PixelFormat.Format32bppArgb)) {
        trimmed.Save(outputPath, ImageFormat.Png);
      }
      output.Dispose();
      Console.WriteLine(string.Format("cutout={0}x{1}, removed={2} pixels", right-left+1, bottom-top+1, tail));
    }
  }

  public static void Resize(string inputPath, string outputPath, int size, bool square) {
    using (var source = new Bitmap(inputPath)) {
      int width = square ? size : size;
      int height = square ? size : (int)Math.Round((double)source.Height * size / source.Width);
      using (var output = new Bitmap(width, height, PixelFormat.Format32bppArgb))
      using (var graphics = Graphics.FromImage(output)) {
        graphics.Clear(Color.Transparent);
        graphics.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
        graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
        graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
        int imageHeight = (int)Math.Round((double)source.Height * size / source.Width);
        graphics.DrawImage(source, new Rectangle(0, (height - imageHeight) / 2, size, imageHeight));
        output.Save(outputPath, ImageFormat.Png);
      }
    }
  }
}
'@

$source = (Resolve-Path -LiteralPath $InputPath).Path
[LogoCutout]::Save($source, $OutputPath)
$directory = [System.IO.Path]::GetDirectoryName($OutputPath)
[LogoCutout]::Resize($OutputPath, (Join-Path $directory 'hanjibung-logo-256.png'), 256, $false)
[LogoCutout]::Resize($OutputPath, (Join-Path $directory 'hanjibung-icon-64.png'), 64, $true)
[LogoCutout]::Resize($OutputPath, (Join-Path $directory 'hanjibung-icon-192.png'), 192, $true)

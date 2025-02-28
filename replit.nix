{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.imagemagick
    pkgs.x265
    pkgs.libde265
    pkgs.libheif
  ];
}

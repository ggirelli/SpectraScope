# SpectraScope
Interactive interface to visualize spectra and filter sets for any microscope. Easily customizable.

The idea behind **SpectraScope** is to provide users with an *easy-to-use* web-interface (that can be directly downloaded and run locally) where to visualize fluorophores and microscope filter sets of interest. This can be invaluable when setting up new optical configurations or designing new microscopy-based experiments.

**Notice!** This interface has been developed for GoogleChrome (v74) and FireFox (v66).  
Thus, it may not be fully compatible with other browsers (e.g., Safari, IExplorer,...).

Live demo
---
A live demo of **SpectraScope**, click on the screenshot below to access it.  
[![demo-screenshot](data/screenshot.png)](https://ggirelli.github.io/SpectraScope/app.html)

Features
---

* Visualize excitation/emission spectra of any fluorophore of interest in the 250-900 nm range. The fluorophore color is automatically selected based on the emission peak in the visible range by using the [wave2color](https://github.com/ggirelli/wave2color) functions.
* Visualize the transmission spectrum of any filter set of interest, overlayed to the fluorophore spectra.
* Explore the spectra with the mouse, seeing the precise relative intensity and wavelength of any point of interest.
* Quickly see a brief description of any spectrum by hovering over it with the mouse, and access the raw data by clicking on them.

Installation
---

Either download the repository's [zip file](https://github.com/ggirelli/SpectraScope/archive/master.zip) or clone it with `git` using:

```bash
git clone http://github.com/ggirelli/spectrascope
```

Then, simply open the `app.html` file with your browser!

**Notice!** This interface has been developed for GoogleChrome (v74) and FireFox (v66). Thus, it may not be fully compatible with other browsers (e.g., Safari, IExplorer,...).

### Known issues

Please, notice that **GoogleChrome** does not allow `crossorigin` requests from local files (i.e., when the address starts with something like `file://` or `C:/`). Thus, when opening `SpectraScope` locally, we recommend either using Mozilla FireFox or installing this tool on an Apache Server.

Usage
---

1. <u>Click</u> on the filters/fluorophores (from the *Settings* panel) to add them to the graph.
2. <u>Click</u> on the selected filters/fluorophores (from the *Selection* panel) to remove them from the graph.
3. <u>Hover</u> over a spectrum to visualize a short description below this paragraph.
4. <u>Click</u> on a spectrum to visualize the raw data at the end of the page.

### How to add a new fluorophore

You can add a new fluorophore in 2 easy steps:

##### (1) Add the fluorophore's excitation/emission spectra

Add the excitation and emission spectra to the `data/fluorophore-spectra` folder as  tabulation-separated files (`.tsv`). The file name should be the fluorophore name followed by `_ex` or `_em`, respectively for excitation and emission spectra. For example, when adding the fluorophore `GFP`, two files should be added: `GFP_ex.tsv` and `GFP_em.tsv`.

Each file should contain two columns (with a header line):

* `w` is the wavelength in nanometers,
* and `ri` is the relative intensity in a.u.. Please, note that the relative intensity should be in the 0-1 range.

Check out the examples available in the default installation [here](https://github.com/ggirelli/SpectraScope/tree/master/data/fluorophore-spectra).

##### (2) Updated the main fluorophore table

Update the `data/fluorophores.tsv` table by adding one line. The table contains 4 tabulation-separated columns:

* `name` is the fluorophore name,
* `wex` is the wavelength (in nm) of the excitation peak,
* `wem` is the wavelength (in nm) of the emission peak,
* and `color` is either "auto" (in which case the color will be calculated based on `wem`; if `wem` is not in the visible range the automatic color will be "black") or an hexadecimal color string of your choice (useful when `wem` is outside the visible range).

Check out the default fluorophores table [here](https://github.com/ggirelli/SpectraScope/blob/master/data/fluorophores.tsv)! In the case of EGFP, you would add a line like below:

```
EGFP 488    509 auto
```

### How to add a new filter

You can add a new fluorophore in 2 easy steps:

##### (1) Add the filter's transmission spectrum

Add the transmission spectrum to the `data/filter-spectra` folder as  tabulation-separated files (`.tsv`). The file name should be the filter name. For example, when adding the filter `EM FF001-625-20`, the file should be named `EM FF01-625-20.tsv`.

The transmission spectrum file should contain two columns (with a header line):

* `w` is the wavelength in nanometers,
* and `ri` is the relative transmitted intensity in a.u.. Please, note that the relative transmitted intensity should be in the 0-1 range.

Check out the examples available in the default installation [here](https://github.com/ggirelli/SpectraScope/tree/master/data/filter-spectra).

##### (2) Update the main filter table

Update the `data/filters.tsv` table by adding one line. The table contains 7 tabulation-separated columns:

* `name` is the fluorophore name,
* `producer` is the filter brand,
* `start` is the wavelength at which the transmittion window begins,
* `width` is the width (in nm) of the transmittion window,
* `color` is either "auto" (in which case the color will be calculated based on `start`; if `start` is not in the visible range the automatic color will be "black") or an hexadecimal color string of your choice (useful when `start` is outside the visible range),
* `nickname` can be used to specify fluorophores compatible with the filters in a comma-separated fashion,
* and `customDescription` can be used to write a short description that is then reported in the interface. If this column is left empty, then the description will be `start/width`.

Check out the default filters table [here](https://github.com/ggirelli/SpectraScope/blob/master/data/filters.tsv)! In the case of the [Semrock FF605-Di02-25x36 filter](https://www.semrock.com/FilterDetails.aspx?id=FF605-Di02-25x36), you would add a line like below:

```
FF605-Di02  Semrock 605 Inf auto    AF594   
```

Contribute
---

We welcome any contributions to `SpectraScope`. Please, refer to the [contribution guidelines](https://github.com/ggirelli/SpectraScope/blob/master/CONTRIBUTING.md) if this is your first time contributing! Also, check out our code of conduct.

License
---

```
MIT License
Copyright (c) 2019 Gabriele Girelli
```
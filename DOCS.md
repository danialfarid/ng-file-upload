## Members

<dl>
<dt><a href="#ClickForwardDirective [ngfClickForward]">ClickForwardDirective [ngfClickForward]</a></dt>
<dd><p>Forwards the click and touch events on this element to the target element.</p>
</dd>
<dt><a href="#DropDirective [ngfDrop]">DropDirective [ngfDrop]</a></dt>
<dd><p>Enables file drag&amp;drop and paste events on this element.</p>
</dd>
<dt><a href="#ImageOrientationDirective [ngfFixOrientation]">ImageOrientationDirective [ngfFixOrientation]</a></dt>
<dd><p>Enables fixing the orientation from EXIF data for image files captured in <code>ngModel</code>.</p>
</dd>
<dt><a href="#ImageResizeDirective [ngfResize]">ImageResizeDirective [ngfResize]</a></dt>
<dd><p>Enables resizing the image file captured in <code>ngModel</code>.</p>
</dd>
<dt><a href="#FileModelDirective [ngModel]">FileModelDirective [ngModel]</a></dt>
<dd><p>Two way binding of the selected/dropped files on the current element to the model.</p>
</dd>
<dt><a href="#SelectComponent [ngf-select]">SelectComponent [ngf-select]</a></dt>
<dd><p>Component for selecting files. It would create a input type file element underneath.</p>
</dd>
<dt><a href="#ThumbDirective [ngfThumb],[ngfSrc],[ngfBackground],[ngfThumbBackground]">[ngfThumbBackground]</a></dt>
<dd><p>Directive for image or media preview. Supports resizing to thumbnail.</p>
</dd>
<dt><a href="#FileValidatorDirective">FileValidatorDirective</a></dt>
<dd><p>Validates the <code>ngModel</code> files on this element.
The error message name would be the validation name without <code>ngf</code> prefix.</p>
</dd>
<dt><a href="#ImageValidatorDirective">ImageValidatorDirective</a></dt>
<dd><p>Validates the <code>ngModel</code> files on this element.
The error message name would be the validation name without <code>ngf</code> prefix.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AspectRatio">AspectRatio</a> : <code>string</code> | <code>float</code></dt>
<dd><p>Aspect ratio string in the format <code>x:y</code> for example <code>2:3</code> or a float value like <code>0.8</code>.</p>
</dd>
<dt><a href="#ResizeOptions">ResizeOptions</a> : <code>object</code></dt>
<dd><p>Resize options.</p>
</dd>
</dl>

<a name="ClickForwardDirective [ngfClickForward]"></a>

## ClickForwardDirective [ngfClickForward]
Forwards the click and touch events on this element to the target element.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfClickForward | <code>string</code> | target element id. If not specified the first <code>ngf-select</code> child element of this element (or whole document if not available) will be chosen as target. |

**Example**  
```js
<button ngfClickForward>
    <ngf-select [(ngModel)]="audioFile" ngfText="Select Audio"></ngf-select>
</button>
<button ngfClickForward="myFileElem">
Or
</button>
<input type="file" id="myFileElem">
```
<a name="DropDirective [ngfDrop]"></a>

## DropDirective [ngfDrop]
Enables file drag&drop and paste events on this element.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfStopPropagation | <code>boolean</code> | if true would stop the drag&drop event propagation to other event handlers. |
| ngfAllowDir | <code>boolean</code> | allow dropping folders for Chrome only. |
| ngfMultiple | <code>boolean</code> | allow dropping multiple files. |
| multiple | <code>boolean</code> | enable multiple file select. |
| ngfMaxFiles | <code>number</code> | max number of files that can be dropped. |
| ngfMaxTotalSize | <code>number</code> | max total size of the files that can be dropped. |
| ngfIncludeDir | <code>boolean</code> | include the directory as a file item in the list of dropped files. |
| ngfDragPattern | <code>string</code> | the pattern to validate if the files that are dragged over are valid for Chrome only. This pattern should only validate the file type since that's the only information available during the drag. |
| ngfEnableFirefoxPaste | <code>boolean</code> | (Experimental) allow file paste on this element in FireFox browser. |
| ngfDragOver | <code>EventEmitter</code> | Emitted on drag over and `$event` indicates number of valid dragged files. You can use this value to know if there is any valid file is being dragged and change the css class of the drop area accordingly. Only for Chrome. |
| ngfChange | <code>EventEmitter</code> | this event will be emitted on files drop. |
| ngfDrop | <code>EventEmitter</code> | this event will be emitted on files drop. |
| ngfDropAvailable | <code>EventEmitter</code> | this event will be emitted only one time and `$event` value is a boolean indicating whether file drag&drop is available for this browser. |

**Example**  
```js
<div ngfDrop [(ngModel)]="files"
[multiple]="multiple" [ngfPattern]="pattern"
[ngfMaxFiles]="maxFiles"
[ngfAllowDir]="allowDir"
(ngfDropAvailable)="dropAvailable=$event"
[hidden]="!dropAvailable"
class="drop-box">
```
<a name="ImageOrientationDirective [ngfFixOrientation]"></a>

## ImageOrientationDirective [ngfFixOrientation]
Enables fixing the orientation from EXIF data for image files captured in `ngModel`.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfFixOrientation | <code>boolean</code> | if true the image file in the model will be processed to apply the orientation that is specified in the EXIF data and generate a new image with the orientation change applied and the EXIF data updated to reflect no orientation. |
| ngfOnFixOrientation | <code>EventEmitter</code> | the event will be emitted after the orientation fix is applied wethere successful or failure. |

**Example**  
```js
<div ngfDrop [(ngModel)]="files"
   ngfFixOrientation="true" (ngfOnFixOrientation)="endOfOrientationFix($event)">
 </div>
```
<a name="ImageResizeDirective [ngfResize]"></a>

## ImageResizeDirective [ngfResize]
Enables resizing the image file captured in `ngModel`.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfResize | [<code>ResizeOptions</code>](#ResizeOptions) | the resize options. |

**Example**  
```js
<div ngfDrop [(ngModel)]="files"
   ngfResize="{ratio:'2:3', pattern:'image/jpeg', centerCrop:true, quality:0.5}"
   (ngfOnResize)="endOfResize($event)">
 </div>
```
<a name="FileModelDirective [ngModel]"></a>

## FileModelDirective [ngModel]
Two way binding of the selected/dropped files on the current element to the model.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfModel | <code>object</code> | model object. |

**Example**  
```js
<div ngfDrop [(ngModel)]="files"></div>
<input type="file" [(ngModel)]="files"></div>
<ngf-select [(ngModel)]="files"></ngf-select>
```
<a name="SelectComponent [ngf-select]"></a>

## SelectComponent [ngf-select]
Component for selecting files. It would create a input type file element underneath.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfAccept | <code>string</code> | the input type file `accept` attribute to filter the selectable files in the popup. more details [here](https://www.w3schools.com/tags/att_input_accept.asp) or [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) |
| ngfMultiple | <code>boolean</code> | allows selecting multiple files, default false. more details [here](https://www.w3schools.com/tags/att_input_multiple.asp) or [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) |
| ngfCapture | <code>string</code> | the input type file `capture` attribute value for mobile devices. more details [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) |
| ngfResetOnClick | <code>boolean</code> | if true the files will be set to empty once this element is clicked/touched. |
| ngfText | <code>string</code> | the text to be shown on this element. |
| ngfHtml | <code>string</code> | the inner html to be set on this element. |
| ngfSelect | <code>EventEmitter</code> | emitted when the files are selected or changed. |
| ngfChange | <code>EventEmitter</code> | emitted when the files are selected or changed. |

**Example**  
```js
<ngf-select [(ngModel)]="files", ngfAccept="image/*"></ngf-select>
```
<a name="FileValidatorDirective"></a>

## FileValidatorDirective
Validates the `ngModel` files on this element.
The error message name would be the validation name without `ngf` prefix.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfMaxSize | <code>FileSize</code> | Maximum allowed file size. |
| ngfMinSize | <code>FileSize</code> | Minimum allowed file size. |
| ngfMaxFiles | <code>number</code> | Maximum number of files allowed. |
| ngfMaxTotalSize | <code>FileSize</code> | Maximum total sum of the file sizes allowed. |
| ngfPattern | <code>FilePattern</code> | The file pattern allowed on this element. |

**Example**  
```js
<ngf-select [(ngModel)]="files", ngfPattern="application/pdf", ngfMaxSize="2MB"></ngf-select>
```
<a name="ImageValidatorDirective"></a>

## ImageValidatorDirective
Validates the `ngModel` files on this element.
The error message name would be the validation name without `ngf` prefix.

**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfDimensions | <code>string</code> | Maximum allowed file size. |
| ngfMinHeight | <code>string</code> | Minimum allowed file size. |
| ngfMaxHeight | <code>number</code> | Maximum number of files allowed. |
| ngfMinWidth | <code>number</code> | Maximum number of files allowed. |
| ngfMaxWidth | <code>number</code> | Maximum number of files allowed. |
| ngfRatio | <code>boolean</code> | Maximum total sum of the file sizes allowed. |
| ngfMinRatio | <code>FilePattern</code> | The file pattern allowed on this element. |
| ngfMaxRatio | <code>FilePattern</code> | The file pattern allowed on this element. |

**Example**  
```js
<div ngfDrop [(ngModel)]="images", ngfRatio="image/*", ngfMaxSize="2MB"></div>
```
<a name="AspectRatio"></a>

## AspectRatio : <code>string</code> \| <code>float</code>
Aspect ratio string in the format `x:y` for example `2:3` or a float value like `0.8`.

**Kind**: global typedef  
<a name="ResizeOptions"></a>

## ResizeOptions : <code>object</code>
Resize options.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ngfResize | <code>object</code> | the resize options. |
| ngfResize.ratio | [<code>AspectRatio</code>](#AspectRatio) | the aspect ratio of the resized image. |
| ngfResize.width | <code>object</code> | the width of the resized image. |
| ngfResize.height | <code>object</code> | the height of the resized image. |
| ngfResize.centerCrop | <code>boolean</code> | if true will center crop the image if it does not fit within the given width/height or ratio otherwise will fit the image within the given boundaries so the resulting image width (or height) could be less than given width (or height) if the original image is taller or wider than the target aspect ratio. Default false. |
| ngfResize.quality | <code>float</code> | quality of the resized image produced, between 0.1 and 1.0. |
| ngfResize.pattern | <code>string</code> | resize only if the files name or type matches the pattern. |
| ngfResize.restoreExif | <code>boolean</code> | default true, will restore exif info on the resized image. |
| ngfResize.type | <code>string</code> | convert it to the given image type format. |
| ngfOnResize | <code>EventEmitter</code> | convert it to the given image type format. |


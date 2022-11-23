import "../css/asset_modal.scss";

function imageToBase64($img) {
  const $canvas = document.createElement("canvas");
  $canvas.width  = $img.naturalWidth;
  $canvas.height = $img.naturalHeight;
  const ctx = $canvas.getContext("2d");
  ctx?.drawImage($img, 0, 0);
  return $canvas.toDataURL("image/png");
}

(async () => {
  document
    .querySelector("#content-body-left ul")
    ?.appendChild(
      document
        .querySelector<HTMLTemplateElement>(
          "#plugin-image-template-panel-nav-item"
        )!
        .content.cloneNode(true)
    );

  document
    .querySelector("#content-body-right-body")
    ?.appendChild(
      document
        .querySelector<HTMLTemplateElement>(
          "#plugin-image-template-panel-body"
        )!
        .content.cloneNode(true)
    );

  const mainPrimaryButton = document.querySelector<HTMLButtonElement>(".actions-bar button.primary")!;
  const primaryButton = mainPrimaryButton.cloneNode(true) as HTMLButtonElement;
  primaryButton.className = "action button btn btn-primary d-none";
  mainPrimaryButton.parentNode?.insertBefore(primaryButton, mainPrimaryButton);
  jQuery("#plugin-image-template-panel-button").on("shown.bs.tab", () => {
    mainPrimaryButton.classList.add("d-none");
    primaryButton.classList.remove("d-none");
  }).on("hide.bs.tab", () => {
    mainPrimaryButton.classList.remove("d-none");
    primaryButton.classList.add("d-none");
  });

  let data = {};
  const parentSearch = new URLSearchParams(parent.document.location.search);
  parentSearch.set("__mode", "image_template_get_templates");
  const {result: templates} = await (await fetch(parent.CMSScriptURI + '?' + parentSearch.toString())).json();

  if (!templates || templates.length === 0) {
    document.querySelector("#plugin-image-template-panel-button")?.classList.add("d-none");
    return;
  }

  const select = document.querySelector<HTMLSelectElement>("#plugin-image-template-panel select")!;
  const container = document.querySelector<HTMLSelectElement>("#plugin-image-template-panel-image")!;
  templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name;
    select.appendChild(option);
  });
  select.addEventListener("change", async () => {
    const template = templates.find((template) => template.id === select.value);

    parent.jQuery(parent.window).trigger('pre_autosave');
    data = parent.DOM.getFormData( parent.document.querySelector(`form[method="post"]`) );
    data.__mode = "image_template_generate_source";
    data.image_template_id = select.value;
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    const {result: source} = await (await fetch(parent.CMSScriptURI, {
      method: "POST",
      body: formData,
    })).json();

    const dom = new DOMParser().parseFromString(source, "image/svg+xml");
    const promises = [...dom.querySelectorAll("img, image")].map(($image) => {
      const img = new Image();
      img.src = $image.getAttribute("href")!;
      return new Promise((resolve) => {
        img.onload = () => {
          const url = imageToBase64(img, "image/jpeg");
          $image.setAttribute('href', url);
          resolve();
        };
      });
    });
    await Promise.all(promises);
    const img = new Image();
    const blob = new Blob([(new XMLSerializer).serializeToString(dom)], { type: 'image/svg+xml' });
    img.src = URL.createObjectURL(blob);
    img.style = "max-width: 100%;";
    container.innerHTML = "";
    container.appendChild(img);
  });
  select.dispatchEvent(new Event("change"));

  const name = document.querySelector<HTMLSelectElement>("#plugin-image-template-panel input")!;
  name.addEventListener("input", () => {
    if (name.value.length !== 0) {
      primaryButton.disabled = false;
      primaryButton.classList.remove("disabled");
    }
    else {
      primaryButton.disabled = true;
      primaryButton.classList.add("disabled");
    }
  });
  let uploaded = false;
  primaryButton.addEventListener("click", async (ev) => {
    const img = container.firstChild as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d");
    context?.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    const bin = atob(dataURL.replace(/^.*,/, ''));
    const buffer = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }
    const blob = new Blob([buffer.buffer], {
        type: "image/png"
    });

    const formData = new FormData();
    formData.append("file", blob, name.value + ".png");
    formData.append("__mode", "js_upload_file");
    formData.append("blog_id", parentSearch.get("blog_id")!);
    formData.append("magic_token", data.magic_token);
    window.uploadFile(formData, {
      setError() {},
      setCancelUpload() {},
      setProgress() { },
      setThumbnail(data) {
        uploaded = true;
        jQuery('#select_asset input[name="id"]').val(data.id);
        mainPrimaryButton.disabled = false;
        mainPrimaryButton.click();
      },
      enableEditAsset() {},
      progressbar: {
        hide() {},
      }
    })
  });
})();

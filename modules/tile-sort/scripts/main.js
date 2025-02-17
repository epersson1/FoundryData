class TileSort extends Application {
  constructor() {
    super();
    this.layer = canvas.tiles;
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: "Tile Sort",
      id: "tile-sort",
      template: `modules/tile-sort/templates/tile-sort.hbs`,
      resizable: true,
      dragDrop: [{ dragSelector: null, dropSelector: null }],
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.switchLayers();
    const el = html.find("#tile-list")[0];
    const _this = this;
    Sortable.create(el, {
      multiDrag: true,
	multiDragKey: "shift",
      animation: 150,
      onChange: function (evt) {
        const levelsUI = Object.values(ui.windows).find(
          (w) => w.id == "levelsUI"
        );
        const levelsOffset = levelsUI?.rendered ? levelsUI?.range[0] ?? 0 : 0;
        let updates = [];
        const length = _this.element.find("li").length;
        _this.element.find("li").each(function (index, element) {
          updates.push({
            _id: $(element).data("tileid"),
            sort: parseInt(length - index + levelsOffset),
          });
        });
        console.log(updates);
        canvas.scene.updateEmbeddedDocuments("Tile", updates);
      },
    });
    html.on("mouseenter", ".tile-sort-item", function (event) {
      const tileId = $(this).data("tileid");
      _this.createHighlight(canvas.tiles.get(tileId));
      $(this).addClass("selected");
    });
    html.on("mouseleave", ".tile-sort-item", function (event) {
      const oldHighlight = canvas.controls.debug.children.find(
        (c) => c.name == "tilesorthighlight"
      );
      if (oldHighlight) oldHighlight.destroy();
    });
    html.on("click", ".tile-sort-item", function (event) {
      const tileId = $(this).data("tileid");
      const tile = canvas.tiles.get(tileId);
      if ($(event.target).is("#hide-tile")) return;
      tile.control({releaseOthers: !event.shiftKey});
      if(event.ctrlKey) canvas.animatePan(tile.center)
      $(this).addClass("controlled");
    });
    html.on("dblclick", ".tile-sort-item", function (event) {
      const tileId = $(this).data("tileid");
      const tile = canvas.tiles.get(tileId);
      tile._onClickLeft2(event);
    });
    html.on("click", "#hide-tile", function (event) {
      const tileId = $(this).data("tileid");
      const tile = canvas.tiles.get(tileId);
      tile.release();
      tile.tileSortHidden = !tile.tileSortHidden;
      tile.refresh();
      $(this).toggleClass("active", tile.tileSortHidden);
    });
    html.on("search", "input", ()=>{_this.loadTileList()});
    this.loadTileList();
  }

  createHighlight(tile) {
    const oldHighlight = canvas.controls.debug.children.find(
      (c) => c.name == "tilesorthighlight"
    );
    if (oldHighlight) oldHighlight.destroy();
    let tileImg = tile.mesh;
    if (!tileImg || !tileImg.texture.baseTexture) return;
    let sprite = PIXI.Sprite.from(tileImg.texture);
    sprite.isSprite = true;
    sprite.anchor.set(tileImg.anchor.x, tileImg.anchor.y)
    sprite.width = tile.mesh.width;
    sprite.height = tile.mesh.height;
    sprite.scale = tile.mesh.scale;
    sprite.position = tile.center
    sprite.angle = tileImg.angle;
    sprite.alpha = 0.5;
    sprite.tint = 0x00ff00;
    sprite.name = "tilesorthighlight";
    canvas.controls.debug.addChild(sprite);
  }

  switchLayers() {
    const isFG = $(`li[data-tool="foreground"]`).hasClass("active");
    const FGElevation = canvas.primary.foreground.elevation;
    this.layer = isFG ? canvas.tiles.placeables.filter(t=> t.document.elevation == FGElevation) : canvas.tiles.placeables.filter(t=> t.document.elevation != FGElevation);
    this.loadTileList();
    this.updateHidden();
  }

  loadTileList() {
    $("#tile-list").empty();
    let layer = [...this.layer]
      .sort((a, b) => -a.document.sort + b.document.sort)
      .filter((p) => p.visible || p.tileSortHidden);
    for (let tile of layer) {
      let $li = this.generateLi(tile);
      $("#tile-list").append($li);
    }
    this.setPosition({ height: "auto" });
  }

  generateLi(tile) {
    const searchTerm = (this.element.find("input").val() || "").toLowerCase();
    let hidden = false;
    if (searchTerm) {
      const tileJson = JSON.stringify(tile.document.toJSON()).toLowerCase();
      hidden = !tileJson.includes(searchTerm);
    }
    const isVideo = tile.document.img?.split(".").pop() == "webm";
    const $li = $(`
      <li class="tile-sort-item${
        tile.controlled ? " controlled" : ""
      } ${hidden ? "hidden" : ""}" data-tileid="${tile.id}">
      <div class="img-container"><i data-tileid="${
        tile.id
      }" id="hide-tile" class="fas fa-eye-slash hide-tile${
      tile.visible ? "" : " active"
    }"></i>${
      isVideo ? "<video" : "<img"
    } class="tile-sort-img" autoplay loop src="${
      tile.document.texture.src
    }" alt="${tile.document.texture.src?.split("/").pop() ?? ""}">${
      isVideo ? "</video>" : ""
    }</div>
      <span class="tile-sort-name" title="${tile.document.texture.src?.split("/")
        .pop() ?? tile.id}">${tile.document.texture.src?.split("/").pop() ?? tile.id}</span>
      </li>
      `);
    return $li;
  }

  updateControlled() {
    this.element.find(".controlled").removeClass("controlled");
    this.layer.forEach((p) => {
      if (p.controlled)
        this.element.find(`[data-tileid="${p.id}"]`).addClass("controlled");
    });
  }

  updateHidden(){
    this.element.find(".hide-tile").each((i,e)=>{
      const tileId = $(e).data("tileid");
      const tile = canvas.tiles.get(tileId);
      $(e).toggleClass("active", !tile.visible);
    });
  }

  getData() {
    return {};
  }

  close() {
    super.close();
    canvas.tiles.placeables.forEach((p) => {
      p.tileSortHidden = false;
      p.refresh();
    });
  }
}

<script lang="ts">
import ColorPicker from "svelte-awesome-color-picker";
import { ulid } from "ulidx";
import {
	type Palette,
	type PaletteKey,
	defaultPalette,
	getContrastRatio,
} from "../lib/color";

interface Highlight {
	id: string;
	name: string;
	foreground: PaletteKey;
	background: PaletteKey;
}

let highlightName = "";

const palette: Palette = { ...defaultPalette };

// 現在選択中の前景色と背景色
let selectedForeground: PaletteKey = "White";
let selectedBackground: PaletteKey = "Black";
let contrastRatio = "";

let highlights: Highlight[] = [];
let editingHighlight: Highlight | null = null; // 現在編集中のHighlight

const updateContrastRatio = (): void => {
	contrastRatio = getContrastRatio(
		palette[selectedForeground],
		palette[selectedBackground],
	).toFixed(2);
};

updateContrastRatio();

const saveHighlight = (name: string): void => {
	if (name.trim() === "") {
		alert("Highlight name cannot be empty!");
		return;
	}

	if (editingHighlight) {
		// 編集中のHighlightを更新
		editingHighlight.name = name;
		editingHighlight.foreground = selectedForeground;
		editingHighlight.background = selectedBackground;
		editingHighlight = null; // 編集モード終了
	} else {
		// 新しいHighlightを保存
		highlights = [
			...highlights,
			{
				id: ulid(),
				name,
				foreground: selectedForeground,
				background: selectedBackground,
			},
		];
	}

	highlightName = ""; // 保存後にリセット
};

const editHighlight = (highlight: Highlight): void => {
	editingHighlight = { ...highlight };
	highlightName = highlight.name;
	selectedForeground = highlight.foreground;
	selectedBackground = highlight.background;
};

const deleteHighlight = (id: string): void => {
	highlights = highlights.filter((highlight) => highlight.id !== id);
};
</script>

<div>
  <h1>Customizable Palette Tester</h1>

  <h2 class="text-xl text-bold mt-4">Edit Palette</h2>
  <div class="flex flex-col gap-4">
    <div class="palette-table">
      {#each Object.keys(palette) as colorName (colorName)}
        <label class="text-right" for="palette-{colorName}">{colorName}:</label>
        <div>
          <ColorPicker
            label="Pick a color"
            name="palette-{colorName}"
            hex={palette[colorName as PaletteKey]}
            on:input={({ detail }) => {
              if (detail.hex) {
                palette[colorName as PaletteKey] = detail.hex;
                updateContrastRatio();
              }
            }}
          />
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="foreground"
              value={colorName}
              bind:group={selectedForeground}
              on:change={updateContrastRatio}
            />
            Foreground
          </label>
          <label>
            <input
              type="radio"
              name="background"
              value={colorName}
              bind:group={selectedBackground}
              on:change={updateContrastRatio}
            />
            Background
          </label>
        </div>
      {/each}
    </div>

    <h2 class="text-xl text-bold mt-4">Edit Highlight</h2>
    <div class="highlight-table">
      <div>Preview:</div>
      <div
        class="preview-box"
        style="background-color: {palette[selectedBackground]}; color: {palette[
          selectedForeground
        ]};"
      >
        Sample Text
      </div>
      <div>Contrast:</div>
      <div style="display: flex; align-items: center; gap: 1rem;">
          <div>{contrastRatio}</div>
          <div
              style="
                  width: 100px;
                  height: 10px;
                  background-color: {parseFloat(contrastRatio) >= 4.5 ? 'green' : parseFloat(contrastRatio) >= 3 ? 'yellow' : 'red'};
              "
          ></div>
      </div>
      <label for="highlight-name">Name:</label>
      <div>
        <input
          type="text"
          name="highlight-name"
          placeholder="Highlight name"
          bind:value={highlightName}
        />
        <button on:click={() => saveHighlight(highlightName)}>
          {editingHighlight ? "Update Highlight" : "Save Highlight"}
        </button>
      </div>
    </div>

    <div></div>

    <h2 class="text-xl text-bold mt-4">Saved Highlights</h2>
    <div>
      {#each highlights as highlight (highlight.id)}
        <div
          class="highlight-item"
          style="background-color: {palette[
            highlight.background
          ]}; color: {palette[highlight.foreground]};"
        >
          <span>{highlight.name}</span>
          <div class="highlight-actions">
            <button on:click={() => editHighlight(highlight)}>Edit</button>
            <button on:click={() => deleteHighlight(highlight.id)}
              >Delete</button
            >
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .palette-table {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, auto) 1fr;
    column-gap: 10px;
    row-gap: 5px;
    align-items: center;
    width: fit-content;
  }
  .preview-box {
    padding: 1rem 2rem;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
  }
  .highlight-table {
    display: grid;
    column-gap: 10px;
    row-gap: 5px;
    grid-template-columns: minmax(0, auto) minmax(0, auto);
    width: fit-content;
    align-items: center;
  }
  .highlight-item {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>

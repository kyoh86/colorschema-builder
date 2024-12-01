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

<style>
    .preview-box {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ccc;
        margin-top: 1rem;
    }
    .palette-table {
      display:grid;
      grid-template-columns: repeat(2, minmax(0, auto) minmax(0, 1fr));
      width: fit-content;
      align-items: center;
    }
    .highlight-table {
      display: grid;
      align-items: center;
      grid-template-columns: minmax(0, auto) minmax(0, auto);
      width: fit-content;
      row-gap: 1rem;
    }
    .highlight-item {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .highlight-actions button {
        margin-left: 0.5rem;
    }
</style>

<div>
    <h1>Customizable Palette Tester</h1>

    <div class="palette-table">
        {#each Object.keys(palette) as colorName (colorName)}
                <label class="bortext-right" for="palette-{colorName}">{colorName}:</label>
                <div class="mr-4">
                  <ColorPicker
                    label="Pick a color"
                    name="palette-{colorName}"
                    hex="{palette[colorName as PaletteKey]}"
                    on:input="{({ detail }) => {
                        if (detail.hex) {
                            palette[colorName as PaletteKey] = detail.hex;
                        }
                    }}"
                  />
                </div>
        {/each}
    </div>

    <h2 class="text-xl mt-4">Create Highlight</h2>
    <div class="highlight-table">
        <label for="foreground">Foreground:</label>
        <select id="foreground" bind:value={selectedForeground} on:change={updateContrastRatio}>
            {#each Object.keys(palette) as colorName}
                <option value={colorName as PaletteKey}>{colorName}</option>
            {/each}
        </select>
        <label for="background">Background:</label>
        <select id="background" bind:value={selectedBackground} on:change={updateContrastRatio}>
            {#each Object.keys(palette) as colorName}
                <option value={colorName as PaletteKey}>{colorName}</option>
            {/each}
        </select>
    </div>

    <div
        class="preview-box"
        style="background-color: {palette[selectedBackground]}; color: {palette[selectedForeground]};"
    >
        Sample Text
    </div>
    <p>Contrast Ratio: {contrastRatio}</p>

    <div>
        <input type="text" placeholder="Highlight name" bind:value={highlightName} />
        <button on:click={() => saveHighlight(highlightName)}>
            {editingHighlight ? "Update Highlight" : "Save Highlight"}
        </button>
    </div>

    <h2>Saved Highlights</h2>
    <div>
        {#each highlights as highlight (highlight.id)}
            <div
                class="highlight-item"
                style="background-color: {palette[highlight.background]}; color: {palette[highlight.foreground]};"
            >
                <span>{highlight.name}</span>
                <div class="highlight-actions">
                    <button on:click={() => editHighlight(highlight)}>Edit</button>
                    <button on:click={() => deleteHighlight(highlight.id)}>Delete</button>
                </div>
            </div>
        {/each}
    </div>
</div>

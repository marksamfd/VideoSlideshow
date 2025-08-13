class VideoToolbar {
  #muteButton;
  #replaceVideoButton;
  constructor(props) {
    this.container = props.container;
    this.onMuteBtnClicked = props.onMuteButton;
    this.onReplaceBtnClicked = props.onReplaceBtn;
    this.#muteButton = this.container.querySelector("#muteVideoBtn");
    this.#replaceVideoButton = this.container.querySelector("#replaceVideoBtn");

    console.log(`${this.constructor.name} initialized `);
  }

  _attachEventListeners() {
    this.#muteButton.addEventListener(
      "click",
      this.onMuteBtnClicked.bind(this)
    );
  }

  changeMuteButtonIcon(muted) {
    console.log(this.#muteButton);
    this.#muteButton.querySelector(".material-symbols-outlined").innerText =
      muted ? "volume_off" : "volume_up";
  }
}

export default VideoToolbar;

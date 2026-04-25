export function DonateButton() {
  return (
    <form
      action="https://www.paypal.com/donate"
      method="post"
      target="_top"
      className="inline-flex"
    >
      <input type="hidden" name="hosted_button_id" value="AU8QJVJ35XESW" />
      <button
        type="submit"
        name="submit"
        title="PayPal - The safer, easier way to pay online!"
        className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Donate
      </button>
      <img
        alt=""
        src="https://www.paypal.com/en_US/i/scr/pixel.gif"
        width="1"
        height="1"
        className="hidden"
      />
    </form>
  )
}

const LineBreakRegex = /(<br\s?\/?>)+/g;

export default function stripLineBreaks (text) {
	return text.replace(LineBreakRegex, ' ');
}
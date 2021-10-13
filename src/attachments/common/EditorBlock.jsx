import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './EditorBlock.css';

const cx = classnames.bind(Styles);

EditorBlock.renderStyleClass = cx('mc-attachment-editor-render-style');
EditorBlock.propTypes = {
	removeBlock: PropTypes.func,
	children: PropTypes.any,
};
export default function EditorBlock({ removeBlock, children }) {
	const controls = [];

	if (removeBlock) {
		controls.push(
			<span
				key="clear"
				className={cx('remove')}
				role="button"
				onClick={removeBlock}
			>
				<i className={cx('icon-bold-x')} />
			</span>
		);
	}

	return (
		<div
			className={cx(
				'mc-attachment-editor-block',
				'mc-attachment-editor-block-context'
			)}
			contentEditable={false}
			unselectable="on"
		>
			{children}
			{controls.length > 0 && (
				<div className={cx('controls')}>{controls}</div>
			)}
		</div>
	);
}

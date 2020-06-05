import React from 'react';
import {scoped} from '@nti/lib-locale';
import {Icons} from '@nti/web-commons';

import Button from '../common/Button';

const t = scoped('modeled-content.attachments.whiteboard.Button', {
	label: 'Attach a Drawing'
});

export default function WhiteboardButton () {
	return (
		<Button label={t('label')}>
			<Icons.Drawing />
		</Button>
	);
}
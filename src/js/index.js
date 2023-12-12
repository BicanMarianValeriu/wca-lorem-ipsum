/**
 * WordPress dependencies
 */
const {
    data: { select, dispatch },
    blocks: { createBlock, registerBlockType },
    blockEditor: { store: blockEditorStore },
} = wp;

import { loremIpsum } from 'react-lorem-ipsum';
import metadata from './../../block.json';

const { name } = metadata;

const settings = {
    transforms: {
        from: [
            {
                type: 'prefix',
                prefix: ':lorem:h',
                transform() {
                    return createBlock('core/heading', {
                        content: loremIpsum({ avgSentencesPerParagraph: 1, startWithLoremIpsum: false, avgWordsPerSentence: 6 })[0].split('.').join(''),
                    });
                },
            },
            ...[1, 2, 3, 4, 5, 6].map((columns) => ({
                type: 'prefix',
                prefix: `:lorem:h${columns + 1}`,
                transform() {
                    return createBlock('core/heading', {
                        level: columns + 1,
                        content: loremIpsum({ avgSentencesPerParagraph: 1, startWithLoremIpsum: false, avgWordsPerSentence: 6 })[0].split('.').join(''),
                    });
                },
            })),
            {
                type: 'prefix',
                prefix: ':lorem',
                transform() {
                    return createBlock('core/paragraph', {
                        content: loremIpsum()[0]
                    });
                },
            },
            ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((columns) => ({
                type: 'prefix',
                prefix: Array(columns + 1).join(':') + 'lorem',
                transform() {
                    let toSelect = [];

                    const { index } = select(blockEditorStore).getBlockInsertionPoint();
                    const selectedBlock = select(blockEditorStore).getSelectedBlockClientId();
                    const parentBlocks = select(blockEditorStore).getBlockParents(selectedBlock);
                    const blockParent = parentBlocks.reverse()[0];

                    loremIpsum({ p: columns }).map((text, i) => {
                        const created = createBlock('core/paragraph', {
                            content: text
                        });

                        dispatch(blockEditorStore).insertBlocks(created, index + i, blockParent);

                        const { clientId } = created;
                        toSelect = [...toSelect, clientId];
                    });

                    dispatch(blockEditorStore).removeBlock(selectedBlock);

                    const firstSelected = toSelect[0];
                    const lastSelected = toSelect.reverse()[0];

                    return dispatch(blockEditorStore).multiSelect(firstSelected, lastSelected);
                },
            })),
            ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((columns) => ({
                type: 'prefix',
                prefix: Array(columns + 1).join(':') + 'lorem:list',
                transform() {
                    let childBlocks = [];

                    const { index } = select(blockEditorStore).getBlockInsertionPoint();
                    const selectedBlock = select(blockEditorStore).getSelectedBlockClientId();
                    const parentBlocks = select(blockEditorStore).getBlockParents(selectedBlock);
                    const blockParent = parentBlocks.reverse()[0];

                    loremIpsum({ 
                        p: columns,
                        avgSentencesPerParagraph: 1,
                        startWithLoremIpsum: false,
                        avgWordsPerSentence: 6,
                    }).map((text) => childBlocks = [...childBlocks, createBlock('core/list-item', {
                        content: text.split('.').join(''),
                    })]);

                    const created = createBlock('core/list', {
                        className: 'is-style-icon--check-circle',
                        style: {
                            spacing: {
                                blockGap: 'var:preset|spacing|xs'
                            }
                        }
                    }, childBlocks);

                    dispatch(blockEditorStore).insertBlocks(created, index, blockParent);
                    const { clientId } = created;

                    dispatch(blockEditorStore).removeBlock(selectedBlock);

                    return dispatch(blockEditorStore).selectBlock(clientId);
                },
            }))
        ],
    },
    edit() {
        return null;
    },
    save() {
        return null;
    },
};

export default (function () {
    registerBlockType({ name, ...metadata }, settings);
})();
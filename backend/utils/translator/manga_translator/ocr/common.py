import numpy as np
from abc import abstractmethod
from typing import List, Union
from collections import Counter
import networkx as nx
import itertools

from ..utils import InfererModule, TextBlock, ModelWrapper, Quadrilateral

class CommonOCR(InfererModule):
    def _generate_text_direction(self, bboxes: List[Union[Quadrilateral, TextBlock]]):
        if len(bboxes) > 0:
            if isinstance(bboxes[0], TextBlock):
                for blk in bboxes:
                    for line_idx in range(len(blk.lines)):
                        yield blk, line_idx
            else:
                from ..utils import quadrilateral_can_merge_region

                G = nx.Graph()
                for i, box in enumerate(bboxes):
                    G.add_node(i, box = box)
                for ((u, ubox), (v, vbox)) in itertools.combinations(enumerate(bboxes), 2):
                    if quadrilateral_can_merge_region(ubox, vbox, aspect_ratio_tol=1):
                        G.add_edge(u, v)
                for node_set in nx.algorithms.components.connected_components(G):
                    nodes = list(node_set)
                    # majority vote for direction
                    dirs = [box.direction for box in [bboxes[i] for i in nodes]]
                    majority_dir = Counter(dirs).most_common(1)[0][0]
                    # sort
                    if majority_dir == 'h':
                        nodes = sorted(nodes, key = lambda x: bboxes[x].aabb.y + bboxes[x].aabb.h // 2)
                    elif majority_dir == 'v':
                        nodes = sorted(nodes, key = lambda x: -(bboxes[x].aabb.x + bboxes[x].aabb.w))
                    # yield overall bbox and sorted indices
                    for node in nodes:
                        yield bboxes[node], majority_dir

    async def recognize(self, image: np.ndarray, textlines: List[Quadrilateral], args: dict, verbose: bool = False) -> List[Quadrilateral]:
        '''
        Performs the optical character recognition, using the `textlines` as areas of interests.
        Returns a `textlines` list with the `textline.text` property set to the detected text string.
        '''
        return await self._recognize(image, textlines, args, verbose)

    @abstractmethod
    async def _recognize(self, image: np.ndarray, textlines: List[Quadrilateral], args: dict, verbose: bool = False) -> List[Quadrilateral]:
        pass


class OfflineOCR(CommonOCR, ModelWrapper):
    _MODEL_SUB_DIR = 'ocr'

    async def _recognize(self, *args, **kwargs):
        return await self.infer(*args, **kwargs)

    @abstractmethod
    async def _infer(self, image: np.ndarray, textlines: List[Quadrilateral], args: dict, verbose: bool = False) -> List[Quadrilateral]:
        pass

# 1. `find_edge_before.py`

# -*- coding: utf-8 -*-
"""
Purpose: Find the index of the left edge of a bughole.
Author: Saron Mariathasan
Date: 15/11/2022
"""

import numpy as np


def find_edge_before(array_bool, start_index):
    bughole_pixels_boundary = np.diff(array_bool[: start_index + 1])
    index_of_boundary = np.argwhere(bughole_pixels_boundary)

    if len(index_of_boundary) == 0:
        edge_before = 0
    else:
        edge_before = (
            index_of_boundary[np.argmin(np.abs(index_of_boundary - start_index))] + 1
        )

    return int(edge_before)


# 2. `find_edge_after.py`

# -*- coding: utf-8 -*-
"""
Purpose: Find the index of pixel just after the right edge of a bughole.
Author: Saron Mariathasan
Date: 15/11/2022
"""

import numpy as np


def find_edge_after(array_bool, start_index):
    bughole_pixels_boundary = np.diff(array_bool[start_index:])
    index_of_boundary = np.argwhere(bughole_pixels_boundary)

    if len(index_of_boundary) == 0:
        edge_after = len(array_bool)
    else:
        index_of_boundary = index_of_boundary + start_index
        edge_after = (
            index_of_boundary[np.argmin(np.abs(index_of_boundary - start_index))] + 1
        )

    return int(edge_after)


# 3. `find_bughole_extent.py`

# -*- coding: utf-8 -*-
"""
Purpose: Finds the extent of a bughole.
Author: Saron Mariathasan
Date: 16/11/2022
"""


def find_bughole_extent(concrete_bool, index_0, index_1):
    from find_edge_before import find_edge_before
    from find_edge_after import find_edge_after

    bughole_axis_1_lower = find_edge_before(concrete_bool[index_0], index_1)
    bughole_axis_1_upper = find_edge_after(concrete_bool[index_0], index_1)

    bughole_axis_0_lower = find_edge_before(concrete_bool[:, index_1], index_0)
    bughole_axis_0_upper = find_edge_after(concrete_bool[:, index_1], index_0)

    return (
        bughole_axis_0_lower,
        bughole_axis_0_upper,
        bughole_axis_1_lower,
        bughole_axis_1_upper,
    )


# 4. `remove_a_bughole.py`

# -*- coding: utf-8 -*-
"""
Purpose: Removes a bughole from a boolean concrete image.
Author: Saron Mariathasan
Date: 16/11/2022
"""


def remove_a_bughole(
    concrete_bool,
    bughole_axis_0_lower,
    bughole_axis_0_upper,
    bughole_axis_1_lower,
    bughole_axis_1_upper,
):
    concrete_bool[
        bughole_axis_0_lower:bughole_axis_0_upper,
        bughole_axis_1_lower:bughole_axis_1_upper,
    ] = False
    return concrete_bool


# 5. `find_bugholes.py`

# -*- coding: utf-8 -*-
"""
Purpose: Finds the number and location of all bugholes in a concrete image.
Author: Saron Mariathasan
Date: 18/11/2022
"""

STARTING_NUM_BUGHOLES = 0


def find_bugholes(concrete_image, threshold):
    import numpy as np
    from find_bughole_extent import find_bughole_extent
    from remove_a_bughole import remove_a_bughole

    concrete_bool = concrete_image < threshold
    bugholes_locations = []
    num_bugholes = STARTING_NUM_BUGHOLES

    while np.sum(concrete_bool) > 0:
        concrete_bool_true_indices = np.argwhere(concrete_bool)
        index_0, index_1 = concrete_bool_true_indices[0]

        (
            bughole_axis_0_lower,
            bughole_axis_0_upper,
            bughole_axis_1_lower,
            bughole_axis_1_upper,
        ) = find_bughole_extent(concrete_bool, index_0, index_1)

        bugholes_locations.append(
            [
                bughole_axis_0_lower,
                bughole_axis_0_upper,
                bughole_axis_1_lower,
                bughole_axis_1_upper,
            ]
        )
        concrete_bool = remove_a_bughole(
            concrete_bool,
            bughole_axis_0_lower,
            bughole_axis_0_upper,
            bughole_axis_1_lower,
            bughole_axis_1_upper,
        )
        num_bugholes += 1

    return num_bugholes, bugholes_locations


# 6. `calc_concrete_bool.py`

# -*- coding: utf-8 -*-
"""
Purpose: Classifies pixels in a concrete image as bughole or non-bughole.
Author: Saron Mariathasan
Date: 15/11/2022
"""


def calc_concrete_bool(concrete_image, threshold):
    return concrete_image < threshold

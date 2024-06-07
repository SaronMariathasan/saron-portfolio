########################################################################
# COMP1521 23T2 -- Assignment 1 -- Pacman!
#
#
# !!! IMPORTANT !!!
# Before starting work on the assignment, make sure you set your tab-width to 8!
# It is also suggested to indent with tabs only.
# Instructions to configure your text editor can be found here:
#   https://cgi.cse.unsw.edu.au/~cs1521/23T2/resources/mips-editors.html
# !!! IMPORTANT !!!
#
#
# This program was written by Saron Mariathasan (z5419561)
# on 26/6/2023. 
#
# This assembly program translates a related C program, which itself simultates
# a simple version of Pacman, the classic arcade game. Players must 
# navigate around a map to collect the dots and avoid the ghosts. To win, Players
# must collect all the dots before being caught by the moving ghosts.
#
# Version 1.0 (12-06-2023): Team COMP1521 <cs1521@cse.unsw.edu.au>
#
########################################################################

#![tabsize(8)]

# Constant definitions.
# !!! DO NOT ADD, REMOVE, OR MODIFY ANY OF THESE DEFINITIONS !!!

# Bools
FALSE = 0
TRUE  = 1

# Directions
LEFT  = 0
UP    = 1
RIGHT = 2
DOWN  = 3
TOTAL_DIRECTIONS = 4

# Map
MAP_WIDTH  = 13
MAP_HEIGHT = 10
MAP_DOTS   = 53
NUM_GHOSTS = 3

WALL_CHAR   = '#'
DOT_CHAR    = '.'
PLAYER_CHAR = '@'
GHOST_CHAR  = 'M'
EMPTY_CHAR  = ' '

# Other helpful constants
GHOST_T_X_OFFSET          = 0
GHOST_T_Y_OFFSET          = 4
GHOST_T_DIRECTION_OFFFSET = 8
SIZEOF_GHOST_T            = 12
SIZEOF_INT                = 4

########################################################################
# DATA SEGMENT
# !!! DO NOT ADD, REMOVE, MODIFY OR REORDER ANY OF THESE DEFINITIONS !!!

	.data
map:
	.byte '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'
	.byte '#', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '#'
	.byte '#', '.', '#', '#', '#', '#', '#', '#', '#', '#', '#', '.', '#'
	.byte '#', '.', '#', ' ', '#', '.', '.', '.', '.', '.', '.', '.', '#'
	.byte '#', '.', '#', '#', '#', '#', '#', '.', '#', '#', '#', '.', '#'
	.byte '#', '.', '.', '.', '.', '.', '#', '.', '#', '.', '.', '.', '#'
	.byte '#', '.', '#', '#', '#', '#', '#', '.', '#', '#', '#', '.', '#'
	.byte '#', '.', '#', '.', '#', '.', '.', '.', '#', '.', '.', '.', '#'
	.byte '#', '.', '.', '.', '.', '.', '#', '.', '.', '.', '#', '.', '#'
	.byte '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'

	.align 2
ghosts:
	.word 3, 3, UP		# ghosts[0]
	.word 4, 5, RIGHT	# ghosts[1]
	.word 9, 7, LEFT	# ghosts[2]

player_x:
	.word 7
player_y:
	.word 5

map_copy:
	.space	MAP_HEIGHT * MAP_WIDTH

	.align 2
valid_directions:
	.space	4 * TOTAL_DIRECTIONS
dots_collected:
	.word	0
x_copy:
	.word	0
y_copy:
	.word	0

lfsr_state:
	.space	4

# print_welcome strings
welcome_msg:
	.asciiz "Welcome to 1521 Pacman!\n"
welcome_msg_wall:
	.asciiz " = wall\n"
welcome_msg_you:
	.asciiz " = you\n"
welcome_msg_dot:
	.asciiz " = dot\n"
welcome_msg_ghost:
	.asciiz " = ghost\n"
welcome_msg_objective:
	.asciiz "\nThe objective is to collect all the dots.\n"
welcome_msg_wasd:
	.asciiz "Use WASD to move.\n"
welcome_msg_ghost_move:
	.asciiz "Ghosts will move every time you move.\nTouching them will end the game.\n"

# get_direction strings
choose_move_msg:
	.asciiz "Choose next move (wasd): "
invalid_input_msg:
	.asciiz "Invalid input! Use the wasd keys to move.\n"

# main strings
dots_collected_msg_1:
	.asciiz "You've collected "
dots_collected_msg_2:
	.asciiz " out of "
dots_collected_msg_3:
	.asciiz " dots.\n"

# check_ghost_collision strings
game_over_msg:
	.asciiz "You ran into a ghost, game over! :(\n"

# collect_dot_and_check_win strings
game_won_msg:
	.asciiz "All dots collected, you won! :D\n"


# ------------------------------------------------------------------------------
#                                 Text Segment
# ------------------------------------------------------------------------------

	.text

############################################################
####                                                    ####
####   Your journey begins here, intrepid adventurer!   ####
####                                                    ####
############################################################

################################################################################
#
# Implement the following functions,
# and check these boxes as you finish implementing each function.
#
#  SUBSET 0
#  - [X] print_welcome
#  SUBSET 1
#  - [ ] main
#  - [ ] get_direction
#  - [ ] play_tick
#  SUBSET 2
#  - [ ] copy_map
#  - [ ] get_valid_directions
#  - [ ] print_map
#  - [ ] try_move
#  SUBSET 3
#  - [ ] check_ghost_collision
#  - [ ] collect_dot_and_check_win
#  - [ ] do_ghost_logic
#     (and also the ghosts part of print_map)
#  PROVIDED
#  - [X] get_seed
#  - [X] random_number


################################################################################
# .TEXT <print_welcome>
	.text
print_welcome:
	# Subset:   0
	#
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $v0, $ra]
	# Clobbers: [$a0, $v0]
	#
	# Locals:
	#   N/A
	#
	# Structure:
	#   print_welcome
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

print_welcome__prologue:
	push 	$ra

print_welcome__body:
	li	$v0, 4
	la	$a0, welcome_msg
	syscall				# printf("Welcome to 1521 Pacman!\n");

	li	$v0, 11
	li	$a0, WALL_CHAR
	syscall				# putchar(WALL_CHAR);

	li	$v0, 4
	la	$a0, welcome_msg_wall
	syscall				# printf(" = wall\n");

	li	$v0, 11
	li	$a0, PLAYER_CHAR
	syscall				# putchar(PLAYER_CHAR);

	li	$v0, 4
	la	$a0, welcome_msg_you
	syscall				# printf(" = you\n");

	li	$v0, 11
	li	$a0, DOT_CHAR
	syscall				# putchar(DOT_CHAR);

	li	$v0, 4
	la	$a0, welcome_msg_dot
	syscall				# printf(" = dot\n");

	li	$v0, 11
	li	$a0, GHOST_CHAR
	syscall				# putchar(GHOST_CHAR);

	li	$v0, 4
	la	$a0, welcome_msg_ghost
	syscall				# printf(" = ghost\n");

	li	$v0, 4
	la	$a0, welcome_msg_objective
	syscall				# printf("\nThe objective is to collect all the dots.\n");

	li	$v0, 4
	la	$a0, welcome_msg_wasd
	syscall				# printf("Use WASD to move.\n");

	li	$v0, 4
	la	$a0, welcome_msg_ghost_move
	syscall				# printf("Ghosts will move every time you move.\nTouching them will end the game.\n");

print_welcome__epilogue:
	pop	$ra

	jr	$ra


################################################################################
# .TEXT <main>
	.text
main:
	# Subset:   1
	#
	# Args:     void
	#
	# Returns:
	#    - $v0: int
	#
	# Frame:    [$ra]
	# Uses:     [$ra, $a0, $v0, $t0]
	# Clobbers: [$a0, $v0, $t0]
	#
	# Locals:
	#   - $t0: play_tick return value
	#
	# Structure:
	#   main
	#   -> [prologue]
	#   -> [body]
	#	-> body
	#	-> move_player_once_loop_body
	#   -> [epilogue]

main__prologue:
	push	$ra

main__body:
	jal	get_seed			# get_seed();
	jal	print_welcome			# print_welcome();

move_player_once_loop_body:
	jal 	print_map 			# print_map();

	li	$v0, 4
	la	$a0, dots_collected_msg_1
	syscall					# printf("You've collected ");

	
	lw	$a0, dots_collected
	li	$v0, 1
	syscall					# printf("%d", dots_collected)

	li	$v0, 4
	la	$a0, dots_collected_msg_2
	syscall					# printf(" out of ");

	li	$v0, 1
	li	$a0, MAP_DOTS
	syscall					# printf("%d", MAP_DOTS);

	li	$v0, 4
	la	$a0, dots_collected_msg_3
	syscall					# printf(" dots.\n");

	la	$a0, dots_collected
	jal 	play_tick
	move	$t0, $v0			# int play_tick_result = play_tick(&dots_collected);

	beq	$t0, FALSE, main__epilogue	# if (play_tick_result == FALSE) goto main_epilogue;
	b move_player_once_loop_body;

main__epilogue:
	
	pop	$ra

	li	$v0, 0				# return 0;		
	jr	$ra


################################################################################
# .TEXT <get_direction>
	.text
get_direction:
	# Subset:   1
	#
	# Args:     void
	#
	# Returns:
	#    - $v0: int
	#
	# Frame:    [$ra]
	# Uses:     [$ra, $a0, $v0, $t0, $t1]
	# Clobbers: [$a0, $v0, $t0, $t1]
	#
	# Locals:
	#   - $t0: direction input from player
	#   - $t1: direction enum return value
	#
	# Structure:
	#   get_direction
	#   -> [prologue]
	#       -> body
	#	-> user_input_loop_condition
	#	-> return_up
	#	-> return_right
	#	-> return_down
	#	-> invalid_input
	#   -> [epilogue]

get_direction__prologue:
	push 	$ra

get_direction__body:
	li	$v0, 4
	la	$a0, choose_move_msg
	syscall						# printf("Choose next move (wasd): ");

get_one_direction__loop_cond:
	li	$v0, 12
	syscall
	move	$t0, $v0				# int input = getchar();

	bne	$t0, 'a', check_if_up_input		# if (input != 'a') goto check_if_up_input;
	li	$t1, LEFT				# int retval = LEFT;
	b 	get_direction__epilogue			# goto get_direction__epilogue;

check_if_up_input:
	bne	$t0, 'w', check_if_right_input		# if (input != 'w') goto check_if_right_input;
	li	$t1, UP					# int retval = UP;
	b 	get_direction__epilogue			# goto get_direction__epilogue;

check_if_right_input:
	bne	$t0, 'd', check_if_down_input		# if (input != 'd') goto check_if_down_input;
	li	$t1, RIGHT				# int retval = RIGHT;
	b 	get_direction__epilogue			# goto get_direction__epilogue;

check_if_down_input:
	bne	$t0, 's', check_if_newline_input	# if (input != 's') goto check_if_newline_input;
	li	$t1, DOWN				# int retval = DOWN;
	b 	get_direction__epilogue			# goto get_direction__epilogue;

check_if_newline_input:
	bne	$t0, '\n', invalid_direction_input	# if (input != 's') goto invalid_direction_input;
	b 	get_one_direction__loop_cond		# goto get_one_direction__loop_cond;

invalid_direction_input:
	li	$v0, 4
	la	$a0, invalid_input_msg
	syscall						# printf("Invalid input! Use the wasd keys to move.\n");
	b 	get_one_direction__loop_cond		# goto get_one_direction__loop_cond;

get_direction__epilogue:
	move 	$v0, $t1				# return retval;
	
	pop	$ra
	
	jr	$ra


################################################################################
# .TEXT <play_tick>
	.text
play_tick:
	# Subset:   1
	#
	# Args:
	#    - $a0: int *dots
	#
	# Returns:
	#    - $v0: int
	#
	# Frame:    [$ra, $s0, $s1]
	# Uses:     [$ra, $s0, $s1, $t0, $t1, $t2, $a0, $a1, $a2, $v0]
	# Clobbers: [$t0, $t1, $t2, $a0, $a1, $a2, $v0]
	#
	# Locals:
	#   - $t0: direction input from user as enum
	#   - $t1: check_ghost_collision return value after moving player
	#   - $t2: check_ghost_collision return value after moving ghosts
	#
	# Structure:
	#   play_tick
	#   -> [prologue]
	#       -> body
	#	-> move_ghosts
	#	-> check_win
	#	-> set_return_value_to_continue_game
	#   -> [epilogue]

play_tick__prologue:
	push 	$ra
	push 	$s0
	push	$s1

play_tick__body:
	move	$s0, $a0

	jal	get_direction
	move	$t0, $v0				# int get_direction_result = get_direction();
	
	la 	$a0, player_x		
	la	$a1, player_y
	move	$a2, $t0
	jal	try_move				# try_move(&player_x, &player_y, get_direction_result);

	jal 	check_ghost_collision
	move	$t1, $v0				# int ghost_collision_check_result = check_ghost_collision();

	beq	$t1, 0, first_ghost_collision_check_fail	# if ( ghost_collision_check_result == 0) goto first_ghost_collision_check_fail;
	li	$s1, FALSE				# int retval = FALSE;

	b 	play_tick__epilogue			# goto play_tick_epilogue;

first_ghost_collision_check_fail:
	li	$s1, TRUE				# int retval = TRUE;

	jal 	do_ghost_logic				# do_ghost_logic();

	jal	check_ghost_collision
	move	$t2, $v0				# ghost_collision_check_result = check_ghost_collision();

	beq	$t2, 0, check_win			# if (ghost_collision_check_result == 0) goto check_win; 
	li	$s1, FALSE				# retval = FALSE;

	b 	play_tick__epilogue			# goto play_tick_epilogue;
check_win:
	move	$a0, $s0
	jal	collect_dot_and_check_win
	move	$s1, $v0				# retval = collect_dot_and_check_win(dots);

	beq	$s1, 0, NOT_retval			# if (retval == 0) goto NOT_retval
	li	$s1, 0					# retval = 0;

	b 	play_tick__epilogue			# goto play_tick_epilogue;

NOT_retval:
	li	$s1, 1					# retval = 1;

play_tick__epilogue:
	move	$v0, $s1				# return retval;
	
	pop	$s1
	pop	$s0
	pop 	$ra

	jr	$ra


################################################################################
# .TEXT <copy_map>
	.text
copy_map:
	# Subset:   2
	#
	# Args:
	#    - $a0: char dst[MAP_HEIGHT][MAP_WIDTH]
	#    - $a1: char src[MAP_HEIGHT][MAP_WIDTH]
	#
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$ra, $a0, $a1, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9]
	# Clobbers: [$a0, $a1, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9]
	#
	# Locals:
	#   - $t0: char *dst
	#   - $t1: char *src
	#   - $t2: int i
	#   - $t3: int j
	#   - $t4: data size of all array elements before intended one
	#   - $t5: MAP_HEIGHT
	#   - $t6: MAP_WIDTH
	#   - $t7: memory address of src[i][j] 
	#   - $t8: value of src[i][j]
	#   - $t9: memory address of dst[i][j] 
	#   
	# Structure:
	#   copy_map
	#   -> [prologue]
	#       -> body
	#	-> map_row_index_loop_start
	#	-> map_col_index_loop_start
	#	-> map_row_index_loop_end
	#   -> [epilogue]

copy_map__prologue:
	push 	$ra

copy_map__body:
	move	$t0, $a0
	move	$t1, $a1
	
	li	$t2, 0					# int i = 0;

loop_copy_map_height__cond:
	bge	$t2, MAP_HEIGHT, copy_map__epilogue	# if ( i >= MAP_HEIGHT) goto copy_map_epilogue;
	li	$t3, 0					# int j = 0;

loop_copy_map_width__cond:
	bge 	$t3, MAP_WIDTH, loop_copy_map_height__step	# if (j >= MAP_WIDTH) goto loop_copy_map_height__step;
	
	li	$t5, MAP_HEIGHT
	li 	$t6, MAP_WIDTH

	mul	$t4, $t2, $t6
	add	$t4, $t4, $t3
	
	add	$t7, $t1, $t4

	lb	$t8, ($t7) 

	add	$t9, $t0, $t4

	sb	$t8, ($t9)

	addi	$t3, $t3, 1				# j++;
	b 	loop_copy_map_width__cond		# goto loop_copy_map_width__cond;

loop_copy_map_height__step:
	addi	$t2, $t2, 1				# i++;
	b 	loop_copy_map_height__cond		# goto loop_copy_map_height__cond;
	
copy_map__epilogue:
	pop	$ra
	
	jr	$ra


################################################################################
# .TEXT <get_valid_directions>
	.text
get_valid_directions:
	# Subset:   2
	#
	# Args:
	#    - $a0: int x
	#    - $a1: int y
	#    - $a2: int dir_array[TOTAL_DIRECTIONS]
	#
	# Returns:
	#    - $v0: int
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4]
	# Uses:     [$ra, $s0, $s1, $s2, $s3, $s4, $a0, $a1, $a2, $v0, 
	#		$t0, $t1]
	# Clobbers: [$a0, $a1, $a2, $v0, $t0, $t1]
	#		
	#
	# Locals:
	#   - $t0: try_move_result
	#   - $t1: &dir_array[valid_dirs]
	#
	# Structure:
	#   get_valid_directions
	#   -> [prologue]
	#       -> body
	#	-> loop_check_direction_valid__cond
	#	-> loop_check_direction_valid__step
	#   -> [epilogue]

get_valid_directions__prologue:
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
	push	$s4

get_valid_directions__body:
	move	$s0, $a0
	move	$s1, $a1
	move	$s2, $a2
	
	li	$s3, 0					# int valid_dirs = 0;
	li	$s4, 0					# int dir = 0;

loop_check_direction_valid__cond:
	bge	$s4, TOTAL_DIRECTIONS, get_valid_directions__epilogue		# if (dir >= TOTAL_DIRECTIONS) goto get_valid_directions_epilogue;
	
#	la	$s5, x_copy				# 
	sw	$s0, x_copy				# x_copy = x;
	sw	$s1, y_copy				# y_copy = y;

	la	$a0, x_copy
	la	$a1, y_copy
	move	$a2, $s4
	jal	try_move				# int try_move_result = try_move(&x_copy, &y_copy, dir);

	move	$t0, $v0

	beqz	$t0, loop_check_direction_valid__step	# if (try_move_result == 0) goto loop_check_direction_valid__step;
	mul	$t1, $s3, SIZEOF_INT			
	add	$t1, $t1, $s2
	sw	$s4, ($t1)				# dir_array[valid_dirs] = dir;

	addi	$s3, $s3, 1				# valid_dirs++;

loop_check_direction_valid__step:
	addi	$s4, $s4, 1				# dir++;
	b loop_check_direction_valid__cond		# goto loop_check_direction_valid__cond;

get_valid_directions__epilogue:
	move	$v0, $s3				# return valid_dirs;
	
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop 	$s0
	pop	$ra
	
	jr	$ra


################################################################################
# .TEXT <print_map>
	.text
print_map:
	# Subset:   2
	#
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4, $s5, $s6, 
	#		$s7,]
	# Uses:     [$ra, $a0, $a1, $s0, $s1, $s2, $s3, $s4, $s5, $s6, 
	#		$s7, $t0, $t1, $t2, $t3, $t4, $t5, 
	#		$t6, $t7, $t8, $t9]
	# Clobbers: [$a0, $a1, $t0, $t1, $t2, $t3, $t4, $t5, 
	#		$t6, $t7, $t8, $t9]
	#
	# Locals:
	#   -$t0: *map_copy
	#   -$t1: MAP_HEIGHT
	#   -$t2: MAP_WIDTH
	#   -$t3: player_y
	#   -$t4: player_x
	#   -$t5: &map_copy[player_y][player_x]
	#   -$t6: PLAYER_CHAR
	#   -$t7: print map row loop counter
	#   -$t8: print map col loop counter
	#   -$t9: &map_copy[i][j]
	# Structure:
	#   print_map
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

print_map__prologue:
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
	push	$s4
	push	$s5
	push	$s6
	push	$s7

print_map__body:
	la	$a0, map_copy
	la	$a1, map
	jal	copy_map				# copy_map(map_copy, map);	
	
	la	$t0, map_copy

	li	$t1, MAP_HEIGHT
	li	$t2, MAP_WIDTH

	lw	$t3, player_y
	lw	$t4, player_x
	
	mul	$t5, $t3, $t2
	add	$t5, $t5, $t4

	add	$t5, $t0, $t5

	li	$t6, PLAYER_CHAR
	sb	$t6, ($t5)				# map_copy[player_y][player_x] = PLAYER_CHAR;


	li	$s0, 0					# int i = 0;

put_ghosts_on_map_loop__cond:
	bge	$s0, NUM_GHOSTS, put_ghosts_on_map_loop__end	# if ( i >= NUM_GHOSTS) goto put_ghosts_on_map_loop__end;

	la	$s1, ghosts
	li	$s2, SIZEOF_GHOST_T

	mul	$s3, $s0, $s2
	add	$s3, $s1, $s3				# &ghosts[i].x

	lw	$s4, ($s3)				# int ghost_x_coord = ghosts[i].x;

	addi	$s5, $s3, SIZEOF_INT

	lw	$s5, ($s5)				# int ghost_y_coord = ghosts[i].y;

	li	$s6, GHOST_CHAR

	mul	$s7, $s5, $t2
	add	$s7, $s7, $s4
	add	$s7, $t0, $s7

	sb	$s6, ($s7)				# map_copy[ghost_y_coord][ghost_x_coord] = GHOST_CHAR;

	addi	$s0, $s0, 1				# i++;

	j 	put_ghosts_on_map_loop__cond		# goto put_ghosts_on_map_loop__cond;

put_ghosts_on_map_loop__end:

	li	$t7, 0					# int i = 0;

loop_print_map_next_row__cond:
	bge	$t7, MAP_HEIGHT, print_map__epilogue	# if ( i >= MAP_HEIGHT) goto copy_map_epilogue;
	li	$t8, 0					# int j = 0;

loop_print_map_tile__cond:
	bge	$t8, MAP_WIDTH, loop_print_map_tile__end	# if ( j >= MAP_WIDTH) goto loop_print_map_tile__end;

	mul	$t9, $t7, $t2
	add	$t9, $t9, $t8
	add	$t9, $t0, $t9

	li	$v0, 11
	lb	$a0, ($t9)
	syscall						# putchar(map_copy[i][j]);

	addi	$t8, $t8, 1				# j++;

	b loop_print_map_tile__cond			# goto loop_print_map_tile__cond;

loop_print_map_tile__end:
	li	$v0, 11
	la	$a0, '\n'
	syscall						# putchar('\n');

	addi	$t7, $t7, 1				# i++;

	b loop_print_map_next_row__cond			# goto loop_print_map_next_row__cond;

print_map__epilogue:
	pop	$s7
	pop	$s6
	pop	$s5
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	
	jr	$ra


################################################################################
# .TEXT <try_move>
	.text
try_move:
	# Subset:   2
	#
	# Args:
	#    - $a0: int *x
	#    - $a1: int *y
	#    - $a2: int directions
	#
	# Returns:
	#    - $v0: int
	#
	# Frame:    [...]
	# Uses:     [...]
	# Clobbers: [...]
	#
	# Locals:
	#   - ...
	#
	# Structure:
	#   try_move
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

try_move__prologue:
	push	$ra
	push 	$s0
	push	$s1

try_move__body:
	move	$s0, $a0
	move	$s1, $a1
	
	lw	$t0, ($a0)				# int new_x = *x;
	lw	$t1, ($a1)				# int new_y = *y;
	move	$t2, $a2

	bne	$t2, LEFT, check_if_direction_up;	# if (direction != LEFT) goto check_if_direction_up;
	addi	$t0, $t0, -1				# new_x--;
	b check_if_wall;				# goto check_if_well;

check_if_direction_up:
	bne	$t2, UP, check_if_direction_right;	# if (direction != UP) goto check_if_direction_right;
	addi	$t1, $t1, -1				# new_y--;
	b check_if_wall					# goto check_if_wall;

check_if_direction_right:
	bne	$t2, RIGHT, check_if_direction_down	# if (direction != RIGHT) goto check_if_direction_down;
	addi 	$t0, $t0, 1				# new_x++;
	b check_if_wall;				# goto check_if_wall;

check_if_direction_down:
	bne	$t2, DOWN, check_if_wall		# if (direction != DOWN) goto check_if_wall;
	addi	$t1, $t1, 1				# new_y++;

check_if_wall:
	la	$t3, map

	li	$t4, MAP_HEIGHT
	li	$t5, MAP_WIDTH

	mul	$t6, $t1, $t5
	add	$t6, $t6, $t0
	add	$t6, $t3, $t6

	lb	$t6, ($t6)

	bne	$t6, WALL_CHAR, set_new_pacman_location	# if (map[new_y][new_x] != WALL_CHAR) goto set_new_pacman_location;
	li	$t7, FALSE				# int retval = FALSE;
	b 	try_move__epilogue			# goto try_move__epilogue;

set_new_pacman_location:
	sb	$t0, ($s0)				# *x = new_x;
	sb	$t1, ($s1)				# *y = new_y;
	li	$t7, TRUE				# int retval = TRUE;

try_move__epilogue:
	move	$v0, $t7
	
	pop	$s1
	pop	$s0
	pop	$ra

	jr	$ra


################################################################################
# .TEXT <check_ghost_collision>
	.text
check_ghost_collision:
	# Subset:   3
	#
	# Args:     void
	# Returns:
	#    - $v0: int
	#
	# Frame:    [...]
	# Uses:     [...]
	# Clobbers: [...]
	#
	# Locals:
	#   - ...
	#
	# Structure:
	#   check_ghost_collision
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

check_ghost_collision__prologue:
	push	$ra

check_ghost_collision__body:
	li	$t0, 0							# int i = 0;

	la	$t1, ghosts
	li	$t2, SIZEOF_GHOST_T			

check_ghost_collision_loop__cond:
	bge	$t0, NUM_GHOSTS, check_ghost_collision_loop__end	# if ( i >= NUM_GHOSTS) goto check_ghost_collision_loop__end;

	mul	$t3, $t0, $t2
	add	$t3, $t1, $t3 						# &ghosts[i].x

	lw	$t4, ($t3)						# int ghost_x_coord = ghosts[i].x;

	addi	$t3, $t3, SIZEOF_INT 

	lw	$t5, ($t3)						# int ghost_y_coord = ghosts[i].y;

	lw	$t6, player_x
	lw	$t7, player_y

	bne	$t4, $t6, check_ghost_collision_loop__step		# if (player_x != ghost_x_coord) goto check_ghost_collision_loop__step;
	bne	$t5, $t7, check_ghost_collision_loop__step		# if (player_y != ghost_y_coord) goto check_ghost_collision_loop__step;    

	li	$v0, 4
	la	$a0, game_over_msg					
	syscall								# printf("You ran into a ghost, game over! :(\n");

	li	$t8, TRUE						# int retval = TRUE;
	b check_ghost_collision__epilogue				# goto check_ghost_collision__epilogue;

check_ghost_collision_loop__step:
	addi	$t0, $t0, 1						# i++;
	b check_ghost_collision_loop__cond				# goto check_ghost_collision_loop__cond;

check_ghost_collision_loop__end:
	li	$t8, FALSE						# int retval = FALSE;

check_ghost_collision__epilogue:
	move	$v0, $t8						# return retval;
	
	pop	$ra
	
	jr	$ra


################################################################################
# .TEXT <collect_dot_and_check_win>
	.text
collect_dot_and_check_win:
	# Subset:   3
	#
	# Args:
	#    - $a0: int *dots_collected
	#
	# Returns:
	#    - $v0: int
	#
	# Frame:    [...]
	# Uses:     [...]
	# Clobbers: [...]
	#
	# Locals:
	#   - ...
	#
	# Structure:
	#   collect_dot_and_check_win
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

collect_dot_and_check_win__prologue:
	push	$ra
	push	$s0

collect_dot_and_check_win__body:
	la	$t0, map

	lw	$t1, player_x
	lw	$t2, player_y

	li	$t3, MAP_HEIGHT
	li	$t4, MAP_WIDTH

	mul	$t5, $t2, $t4
	add	$t5, $t5, $t1 
	add	$t5, $t0, $t5				# char *map_char = &map[player_y][player_x];

	lb	$t6, ($t5)
	bne	$t6, DOT_CHAR, no_dot_collected		# if (*map_char != DOT_CHAR) goto no_dot_collected;

	li	$t7, EMPTY_CHAR
	sb	$t7, ($t5)				# *map_char = EMPTY_CHAR;

	lw	$t8, ($a0)
	addi	$t8, $t8, 1
	sw	$t8, ($a0)				# (*dots)++;

	lw	$t9, ($a0)
	bne	$t9, MAP_DOTS, no_dot_collected		# if (*dots != MAP_DOTS) goto no_dot_collected;

	li	$v0, 4
	la	$a0, game_won_msg
	syscall						# printf("All dots collected, you won! :D\n");

	li	$s0, TRUE				# int retval = TRUE;
	b collect_dot_and_check_win__epilogue		# goto collect_dot_and_check_win__epilogue;

no_dot_collected:
	li	$s0, FALSE				# int retval = FALSE;

collect_dot_and_check_win__epilogue:
	move	$v0, $s0				# return retval;
	
	pop	$s0
	pop	$ra

	jr	$ra


################################################################################
# .TEXT <do_ghost_logic>
	.text
do_ghost_logic:
	# Subset:   3
	#
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [...]
	# Uses:     [...]
	# Clobbers: [...]
	#
	# Locals:
	#   - ...
	#
	# Structure:
	#   do_ghost_logic
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

do_ghost_logic__prologue:
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
	push	$s4

do_ghost_logic__body:
	li	$s0, 0					# int ghost_id = 0;

	la	$s1, ghosts
	li	$s2, SIZEOF_GHOST_T
do_ghost_logic_loop__cond:
	bge	$s0, NUM_GHOSTS, do_ghost_logic__epilogue	# if ( ghost_id >= NUM_GHOSTS) goto do_ghost_logic__epilogue;
	
	mul	$s3, $s0, $s2
	add	$s3, $s1, $s3 				# &ghosts[ghost_id].x

	lw	$t2, ($s3)				# int ghost_x_coord = ghosts[ghost_id].x;

	addi	$t3, $s3, SIZEOF_INT 			# &ghosts[ghost_id].y

	lw	$t3, ($t3)				# int ghost_y_coord = ghosts[ghost_id].y;

	move	$a0, $t2				# int n_valid_dirs = get_valid_directions(	
	move	$a1, $t3				#     ghost_x_coord,
	la	$a2, valid_directions			#     ghost_y_coord,
	jal	get_valid_directions			#     valid_directions
							# );
	move	$s4, $v0					

	bnez	$s4, ghost_can_move			# if (n_valid_dirs != 0) goto ghost_can_move;
	b do_ghost_logic_loop__step			# goto do_ghost_logic_loop__step;

ghost_can_move:
	bgt	$s4, 2, move_ghost_at_decision_point	# if ( n_valid_dirs > 2) goto move_ghost_at_decision_point;

	move	$a0, $s3				# int *ghost_x_coord_address = &ghosts[ghost_id].x;

	addi	$t4, $s3, SIZEOF_INT
	
	move	$a1, $t4				# int *ghost_y_coord_adddres = &ghosts[ghost_id].y;

	addi	$t4, $t4, SIZEOF_INT		

	lw	$a2, ($t4)				# int ghost_dir = ghosts[ghost_id].direction;

	jal	try_move
	move	$t5, $v0				

	beqz	$t5, move_ghost_at_decision_point	#  if (try_move(
							#         ghost_x_coord_address,
							#	  ghost_y_coord_adddres,
							#	  ghost_dir
							#     ) == 0) goto move_ghost_at_decision_point;
	b do_ghost_logic_loop__step			# goto do_ghost_logic_loop__step;

move_ghost_at_decision_point:
	jal	random_number
	move	$t6, $v0

	remu 	$t6, $t6, $s4				# uint32_t dir_index = random_number() % n_valid_dirs;

	la	$t7, valid_directions
	
	mul	$t8, $t6, SIZEOF_INT
	add	$t7, $t7, $t8				# &valid_directions[dir_index];
	
	lw	$t7, ($t7)

	move	$t9, $s3
	addi	$t9, $t9, SIZEOF_INT
	addi	$t9, $t9, SIZEOF_INT			# &ghosts[ghost_id].direction

	sw	$t7, ($t9)				# ghosts[ghost_id].direction = valid_directions[dir_index];

	move	$a0, $s3				# try_move(
	
	move	$a1, $s3				#     &ghosts[ghost_id].x,
	addi	$a1, $a1, SIZEOF_INT			#     &ghosts[ghost_id].y,
	
	move	$t0, $a1				#     ghosts[ghost_id].direction
	addi	$t0, $t0, SIZEOF_INT			# );
	lw	$a2, ($t0)
	
	jal 	try_move

do_ghost_logic_loop__step:
	addi	$s0, $s0, 1				# ghost_id++;
	b do_ghost_logic_loop__cond			# goto do_ghost_logic_loop__cond;

do_ghost_logic__epilogue:
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	
	jr	$ra


################################################################################
################################################################################
###                   PROVIDED FUNCTIONS — DO NOT CHANGE                     ###
################################################################################
################################################################################

	.data
get_seed_prompt_msg:
	.asciiz "Enter a non-zero number for the seed: "
invalid_seed_msg:
	.asciiz "Seed can't be zero.\n"

################################################################################
# .TEXT <get_seed>
	.text
get_seed:
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$v0, $a0]
	# Clobbers: [$v0, $a0]
	#
	# Locals:
	#   - $v0: copy of lfsr_state
	#
	# Structure:
	#   get_seed
	#   -> [prologue]
	#       -> body
	#       -> loop_start
	#       -> loop_end
	#   -> [epilogue]
	#
	# PROVIDED FUNCTION — DO NOT CHANGE

get_seed__prologue:
	begin
	push	$ra

get_seed__body:
get_seed__loop:					# while (TRUE) {
	li	$v0, 4				#   syscall 4: print_string
	la	$a0, get_seed_prompt_msg
	syscall					#   printf("Enter a non-zero number for the seed: ");

	li	$v0, 5				#   syscall 5: read_int
	syscall
	sw	$v0, lfsr_state			#   scanf("%u", &lfsr_state);

	bnez	$v0, get_seed__loop_end		#   if (lfsr_state != 0) break;

	li	$v0, 4				#   syscall 4: print_string
	la	$a0, invalid_seed_msg
	syscall					#   printf("Seed can't be zero.\n");

	b	get_seed__loop			# }

get_seed__loop_end:
get_seed__epilogue:
	pop	$ra
	end

	jr	$ra


################################################################################
# .TEXT <random_number>
	.text
random_number:
	# Args:     void
	#
	# Returns:
	#    - $v0: uint32_t
	#
	# Frame:    [$ra]
	# Uses:     [$t0, $t1, $t2, $v0]
	# Clobbers: [$t0, $t1, $t2, $v0]
	#
	# Locals:
	#   - $t0: uint32_t bit
	#   - $t1: copy of lfsr_state
	#   - $t2: temporary shift result
	#
	# Structure:
	#   random_number
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]
	#
	# PROVIDED FUNCTION — DO NOT CHANGE

random_number__prologue:
	begin
	push	$ra

random_number__body:
	lw	$t1, lfsr_state		# load lfsr_state
	move	$t0, $t1		# uint32_t bit = lfsr_state;

	srl	$t2, $t1, 10		# lfsr_state >> 10
	xor	$t0, $t0, $t2		# bit ^= lfsr_state >> 10;

	srl	$t2, $t1, 30		# lfsr_state >> 30
	xor	$t0, $t0, $t2		# bit ^= lfsr_state >> 30;

	srl	$t2, $t1, 31		# lfsr_state >> 31
	xor	$t0, $t0, $t2		# bit ^= lfsr_state >> 31;

	andi	$t0, $t0, 1		# bit &= 0x1u;

	sll	$t1, $t1, 1		# lfsr_state <<= 1;
	or	$t1, $t1, $t0		# lfsr_state |= bit;

	sw	$t1, lfsr_state		# store lfsr_state
	move	$v0, $t1		# return lfsr_state;

random_number__epilogue:
	pop	$ra
	end

	jr	$ra
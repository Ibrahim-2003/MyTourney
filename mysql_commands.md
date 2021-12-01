# Paginate Results
    SELECT * FROM 'table_name' LIMIT starting_offset,number_of_returned_rows
        Example:
        SQL -> SELECT * FROM 'table_name' LIMIT 5,10
        English -> Retrieve rows 6-15 from the table named "table_name"

# Order Results by Ascending Order
    SELECT * FROM 'table_name' ORDER BY 'column_name' ASC
    Example:
    SQL -> SELECT * FROM 'users' ORDER BY 'points' ASC
    English -> Retrieve the rows from the table named "users" in ascending order of points

# Order Results by Descending Order
    SELECT * FROM 'table_name' ORDER BY 'column_name' DESC
    Example:
    SQL -> SELECT * FROM 'users' ORDER BY 'points' DESC
    English -> Retrieve the rows from the table named "users" in descending order of points

# Select Row
    SELECT * FROM 'table_name' WHERE 'column_name' = 'value'
        Example:
        SQL -> SELECT * FROM 'users' WHERE 'user_id' = '1'
        English -> Retrieve the rows from the table named "users" that have user_id of 1

# Add Row
    INSERT INTO 'table_name' SET {'column_name1': 'value', 'column_name2': 'value', 'column_name3': 'value'}
        Example:
        SQL -> INSERT INTO 'users' SET {'username': 'name', 'password': 'password', 'age': '25'}
        Englsih -> Add a new row to the table named "users" with these values 

# Delete Row
    DELETE FROM 'table_name' WHERE 'column_name' = 'value'
        Example:
        SQL -> DELETE FROM 'tourneys' WHERE 'hosts_hosts_id' = '4'
        English -> Delete the rows from the table named "tourneys" that have host_id of 4

# Add Column
    ALTER TABLE 'table_name' ADD COLUMN 'column_name' 'datatype'
        Example:
        SQL -> ALTER TABLE 'users' ADD COLUMN 'team_id' INT
        English -> Add an integer column named "team_id" to the table named "users"

# Delete Column
    ALTER TABLE 'table_name' DROP COLUMN 'column_name'
    Example:
        SQL -> ALTER TABLE 'users' DROP COLUMN 'team_id'
        English -> Delete the column named "team_id" from the table named "users"

 # Node - MySQL Documentation
    https://www.npmjs.com/package/mysql#performing-queries
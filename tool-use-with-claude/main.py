def greeting():
    print("hi there")


def calculate_pi(digits=5):
    """
    Calculate pi to the specified number of decimal digits.
    Uses the Machin formula for faster convergence.
    
    Args:
        digits: Number of decimal digits to calculate (default: 5)
    
    Returns:
        float: Approximation of pi
    """
    # Using Machin's formula: pi/4 = 4*arctan(1/5) - arctan(1/239)
    # This converges much faster than the Leibniz formula
    
    def arctan(x, num_terms):
        """Calculate arctan using Taylor series"""
        result = 0
        x_squared = x * x
        x_power = x
        for n in range(num_terms):
            sign = (-1) ** n
            result += sign * x_power / (2 * n + 1)
            x_power *= x_squared
        return result
    
    # Calculate number of terms needed for desired precision
    # More digits require more terms
    num_terms = 100 + digits * 20
    
    # Machin's formula
    pi_approx = 4 * (4 * arctan(1/5, num_terms) - arctan(1/239, num_terms))
    
    return pi_approx
